import { Injectable } from '@nestjs/common';
import * as jose from 'jose';

@Injectable()
export class JwtService {
    private readonly secret: Uint8Array;

    constructor() {
        this.secret = new TextEncoder().encode(
            process.env.SUPABASE_SERVICE_ROLE_KEY || 'secret',
        );
    }

    async generateToken(userId: string): Promise<string> {
        const token = await new jose.SignJWT({ userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(this.secret);
        return token;
    }

    async verifyToken(token: string): Promise<string | null> {
        try {
            const { payload } = await jose.jwtVerify(token, this.secret);
            return payload.userId as string;
        } catch {
            return null;
        }
    }
}