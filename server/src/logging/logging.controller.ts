import { Controller, Post, Body, Headers } from '@nestjs/common';
import {LoggingService} from "./logging.service.js";
import {LogDecideDto} from "./dto/log-decide.dto.js";
import {LogDetailDto} from "./dto/log-detail.dto.js";


@Controller('make-server/log')
export class LoggingController {
    constructor(private readonly loggingService: LoggingService) {}

    @Post('decide')
    async logDecide(
        @Headers('authorization') authHeader: string | undefined,
        @Body() logDecideDto: LogDecideDto,
    ) {
        try {
            const token = authHeader?.split(' ')[1] || null;
            return await this.loggingService.logDecide(token, logDecideDto);
        } catch (error: any) {
            console.error('Decide log error:', error);
            throw error;
        }
    }

    @Post('detail')
    async logDetail(
        @Headers('authorization') authHeader: string | undefined,
        @Body() logDetailDto: LogDetailDto,
    ) {
        try {
            const token = authHeader?.split(' ')[1] || null;
            return await this.loggingService.logDetail(token, logDetailDto);
        } catch (error: any) {
            console.error('Detail log error:', error);
            throw error;
        }
    }
}