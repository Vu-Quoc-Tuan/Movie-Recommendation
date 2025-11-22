import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {KvStoreService} from "../common/kv-store/kv-store.service.js";
import {JwtService} from "../common/jwt/jwt.service.js";
import {RegisterDto} from "./dto/register.dto.js";
import {LoginDto} from "./dto/login.dto.js";
import {SupabaseService} from "../common/supabase/supabase.service.js";


@Injectable()
export class AuthService {
    constructor(
        private readonly kvStore: KvStoreService,
        private readonly supabase: SupabaseService,
        private readonly jwtService: JwtService,
    ) {}

    async ensureUserInPublicTable(userId: string) {
        try {
            const supabase = this.supabase.getClient();
            const { data } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .maybeSingle();

            if (data) return;

            const email = await this.kvStore.get(`user:id:${userId}`);
            if (!email) return;

            const user = await this.kvStore.get(`user:${email}`);
            if (!user) return;

            const { error } = await supabase.from('users').upsert({
                id: userId,
                email: user.email,
                name: user.name,
                created_at: user.createdAt || new Date().toISOString(),
            });

            if (error) {
                console.warn('Warning: Could not sync user to public.users table:', error.message);
            } else {
                console.log('Synced user to public.users:', userId);
            }
        } catch (err) {
            console.error('Error in ensureUserInPublicTable:', err);
        }
    }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        if (!email || !password) {
            throw new BadRequestException('Email and password required');
        }

        console.log('Register request received');
        console.log('Checking if user exists:', email);

        const existingUser = await this.kvStore.get(`user:${email}`);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        console.log('Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);

        const userId = crypto.randomUUID();
        const user = {
            id: userId,
            email,
            name: name || '',
            passwordHash,
            createdAt: new Date().toISOString(),
            locale: 'vi',
            region: 'VN',
            comfortOnDefault: true,
            vibesPref: [],
        };

        console.log('Saving user to KV:', userId);
        await this.kvStore.set(`user:${email}`, user);
        await this.kvStore.set(`user:id:${userId}`, email);

        console.log('Syncing to public.users...');
        await this.ensureUserInPublicTable(userId);

        console.log('Generating token...');
        const token = await this.jwtService.generateToken(userId);

        console.log('Registration successful:', userId);
        return {
            user: { id: user.id, email: user.email, name: user.name },
            token,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new BadRequestException('Email and password required');
        }

        const user = await this.kvStore.get(`user:${email}`);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.ensureUserInPublicTable(user.id);

        const token = await this.jwtService.generateToken(user.id);

        return {
            user: { id: user.id, email: user.email, name: user.name },
            token,
        };
    }
}