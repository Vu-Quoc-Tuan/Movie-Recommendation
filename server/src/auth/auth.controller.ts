import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {AuthService} from "./auth.service.js";
import {RegisterDto} from "./dto/register.dto.js";
import {LoginDto} from "./dto/login.dto.js";


@Controller('make-server/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.OK)
    async register(@Body() registerDto: RegisterDto) {
        try {
            return await this.authService.register(registerDto);
        } catch (error: any) {
            console.error('Registration error details:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto);
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    }
}