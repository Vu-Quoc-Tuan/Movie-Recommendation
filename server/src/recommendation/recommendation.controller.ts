import { Controller, Post, UseGuards, Request, Get } from '@nestjs/common';
import {RecommendationService} from "./recommendation.service.js";
import {JwtAuthGuard} from "../common/guards/jwt-auth.guard.js";


@Controller('make-server/recommend')
export class RecommendationController {
    constructor(private readonly recommendationService: RecommendationService) {}

    @Post('personal')
    @UseGuards(JwtAuthGuard)
    async getPersonalRecommendations(@Request() req) {
        try {
            return await this.recommendationService.getPersonalRecommendations(req.userId);
        } catch (error: any) {
            console.error('Recommendation error:', error);
            throw error;
        }
    }

    @Get('random')
    async getRandomRecommendations() {
        try {
            return await this.recommendationService.getRandomRecommendations();
        } catch (error: any) {
            console.error('Random recommendation error:', error);
            throw error;
        }
    }
}