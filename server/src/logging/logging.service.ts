import { Injectable } from '@nestjs/common';
import {KvStoreService} from "../common/kv-store/kv-store.service.js";
import {JwtService} from "../common/jwt/jwt.service.js";
import {LogDecideDto} from "./dto/log-decide.dto.js";
import {LogDetailDto} from "./dto/log-detail.dto.js";

@Injectable()
export class LoggingService {
    constructor(
        private readonly kvStore: KvStoreService,
        private readonly jwtService: JwtService,
    ) {}

    async logDecide(token: string | null, logDecideDto: LogDecideDto) {
        const userId = token ? await this.jwtService.verifyToken(token) : null;
        const finalUserId = userId || 'anonymous';

        const { movie_id, platform } = logDecideDto;

        const logId = crypto.randomUUID();
        const log = {
            id: logId,
            userId: finalUserId,
            movieId: movie_id,
            platform,
            type: 'decide',
            createdAt: new Date().toISOString(),
        };

        if (userId && userId !== 'anonymous') {
            await this.kvStore.set(`history:${userId}:${logId}`, log);
        }
        await this.kvStore.set(`log:decide:${logId}`, log);

        console.log('Decide log recorded:', { userId: finalUserId, movie_id, platform });

        return { success: true };
    }

    async logDetail(token: string | null, logDetailDto: LogDetailDto) {
        const userId = token ? await this.jwtService.verifyToken(token) : null;
        const finalUserId = userId || 'anonymous';

        const { movie_id } = logDetailDto;

        const logId = crypto.randomUUID();
        const log = {
            id: logId,
            userId: finalUserId,
            movieId: movie_id,
            type: 'detail',
            createdAt: new Date().toISOString(),
        };

        await this.kvStore.set(`log:detail:${logId}`, log);

        console.log('Detail log recorded:', { userId: finalUserId, movie_id });

        return { success: true };
    }
}