import { Controller, Post, Body } from '@nestjs/common';
import {AiService} from "./ai.service.js";
import {AnalyzeEmotionalJourneyDto} from "./dto/analyze-emotional-journey.dto.js";
import {AnalyzePartyMoodDto} from "./dto/analyze-party-mood.dto.js";
import {AnalyzeCharacterMatchDto} from "./dto/analyze-character-match.dto.js";

@Controller('make-server')
export class AiController {
    constructor(private readonly aiService: AiService) {}

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