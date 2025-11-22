import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {KvStoreService} from "../common/kv-store/kv-store.service.js";
import {SupabaseService} from "../common/supabase/supabase.service.js";
import {JwtService} from "../common/jwt/jwt.service.js";
import {SaveMovieDto} from "./dto/save-movie.dto.js";


@Injectable()
export class UserService {
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

    async getProfile(userId: string) {
        const email = await this.kvStore.get(`user:id:${userId}`);
        if (!email) {
            throw new NotFoundException('User not found');
        }

        const user = await this.kvStore.get(`user:${email}`);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            locale: user.locale,
            region: user.region,
            comfortOnDefault: user.comfortOnDefault,
            vibesPref: user.vibesPref,
        };
    }

    async saveMovie(userId: string, saveMovieDto: SaveMovieDto) {
        const { movie_id } = saveMovieDto;

        const saveId = crypto.randomUUID();
        const saved = {
            id: saveId,
            userId,
            movieId: movie_id,
            createdAt: new Date().toISOString(),
        };

        await this.kvStore.set(`saved:${userId}:${movie_id}`, saved);

        return { success: true };
    }

    async getSavedMovies(userId: string) {
        const savedMovies = await this.kvStore.getByPrefix(`saved:${userId}:`);
        return savedMovies || [];
    }

    async getHistory(userId: string) {
        const supabase = this.supabase.getClient();

        const { data: historyData, error: historyError } = await supabase
            .from('user_history')
            .select('id, movie_id, watched_at')
            .eq('user_id', userId)
            .order('watched_at', { ascending: false })
            .limit(50);

        if (historyError) {
            console.error('Supabase history error:', historyError);
            throw historyError;
        }

        if (!historyData || historyData.length === 0) {
            return [];
        }

        const movieIds = historyData.map((item: any) => item.movie_id);

        const { data: moviesData, error: moviesError } = await supabase
            .from('movies')
            .select('id, title, year, genre, poster_url, movie_overview')
            .in('id', movieIds);

        if (moviesError) {
            console.error('Supabase movies error:', moviesError);
            throw moviesError;
        }

        const result = historyData.map((historyItem: any) => {
            const movie = moviesData?.find((m: any) => m.id === historyItem.movie_id);
            return {
                ...historyItem,
                movies: movie || null,
            };
        });

        return result;
    }

    async addHistory(userId: string, saveMovieDto: SaveMovieDto) {
        const { movie_id } = saveMovieDto;

        await this.ensureUserInPublicTable(userId);

        const supabase = this.supabase.getClient();
        const { error } = await supabase.from('user_history').insert({
            user_id: userId,
            movie_id: movie_id,
            watched_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Supabase insert history error:', error);
            throw error;
        }

        return { success: true };
    }

    async deleteHistory(userId: string, movieId: string) {
        if (!movieId) {
            throw new Error('Movie ID is required');
        }

        const supabase = this.supabase.getClient();
        const { error } = await supabase
            .from('user_history')
            .delete()
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        console.log('History deleted:', { userId, movieId });
        return { success: true };
    }
}