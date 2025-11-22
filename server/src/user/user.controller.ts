import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {JwtAuthGuard} from "../common/guards/jwt-auth.guard.js";
import {UserService} from "./user.service.js";
import {SaveMovieDto} from "./dto/save-movie.dto.js";


@Controller('make-server/user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    async getProfile(@Request() req) {
        try {
            return await this.userService.getProfile(req.userId);
        } catch (error: any) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    @Post('save')
    async saveMovie(@Request() req, @Body() saveMovieDto: SaveMovieDto) {
        try {
            return await this.userService.saveMovie(req.userId, saveMovieDto);
        } catch (error: any) {
            console.error('Save movie error:', error);
            throw error;
        }
    }

    @Get('saved')
    async getSavedMovies(@Request() req) {
        try {
            return await this.userService.getSavedMovies(req.userId);
        } catch (error: any) {
            console.error('Get saved movies error:', error);
            throw error;
        }
    }

    @Get('history')
    async getHistory(@Request() req) {
        try {
            return await this.userService.getHistory(req.userId);
        } catch (error: any) {
            console.error('Get history error:', error);
            throw error;
        }
    }

    @Post('history')
    async addHistory(@Request() req, @Body() saveMovieDto: SaveMovieDto) {
        try {
            return await this.userService.addHistory(req.userId, saveMovieDto);
        } catch (error: any) {
            console.error('Add history error:', error);
            throw error;
        }
    }

    @Delete('history/:movie_id')
    async deleteHistory(@Request() req, @Param('movie_id') movieId: string) {
        try {
            return await this.userService.deleteHistory(req.userId, movieId);
        } catch (error: any) {
            console.error('Delete history error:', error);
            throw error;
        }
    }
}