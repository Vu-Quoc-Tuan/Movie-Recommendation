import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    HttpException, HttpStatus
} from '@nestjs/common';
import {AiService} from "./ai.service.js";
import {AnalyzeEmotionalJourneyDto} from "./dto/analyze-emotional-journey.dto.js";
import {AnalyzePartyMoodDto} from "./dto/analyze-party-mood.dto.js";
import {AnalyzeCharacterMatchDto} from "./dto/analyze-character-match.dto.js";
import {ClovaSTTService} from "../common/ai/clova-stt.service.js";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('make-server')
export class AiController {
    constructor(private readonly aiService: AiService,
        private readonly clovaSTT: ClovaSTTService,
    ) {}


    @Post('stt')
    @UseInterceptors(FileInterceptor('audio'))
    async speechToText(@UploadedFile() file: Express.Multer.File) {
        try {
            console.log('STT request received');

            if (!file) {
                throw new BadRequestException('Audio file is required');
            }

            console.log('Audio file received:', file.originalname, file.mimetype, file.size);

            // Convert Buffer to ArrayBuffer
            const arrayBuffer = file.buffer.buffer.slice(
                file.buffer.byteOffset,
                file.buffer.byteOffset + file.buffer.byteLength
            );

            const result = await this.clovaSTT.speechToTextAPI(arrayBuffer);

            if (!result) {
                throw new HttpException(
                    { error: 'STT failed or returned no text' },
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            console.log('CLOVA Response:', result);
            return result;
        } catch (error: any) {
            console.error('STT Error:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                { error: error.message || 'Internal Server Error' },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('analyze-emotional-journey')
    async analyzeEmotionalJourney(@Body() dto: AnalyzeEmotionalJourneyDto) {
        try {
            return await this.aiService.analyzeEmotionalJourney(dto);
        } catch (err: any) {
            console.error('🔥 Emotional journey error:', err);
            throw err;
        }
    }

    @Post('analyze-party-mood')
    async analyzePartyMood(@Body() dto: AnalyzePartyMoodDto) {
        try {
            return await this.aiService.analyzePartyMood(dto);
        } catch (err: any) {
            console.error('🔥 Party mode error:', err);
            throw err;
        }
    }

    @Post('analyze-character-match')
    async analyzeCharacterMatch(@Body() dto: AnalyzeCharacterMatchDto) {
        try {
            return await this.aiService.analyzeCharacterMatch(dto);
        } catch (error: any) {
            console.error('Analyze character match error:', error);
            throw error;
        }
    }
}