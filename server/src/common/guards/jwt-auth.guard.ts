import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from "../jwt/jwt.service.js";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Unauthorized');
        }

        const userId = await this.jwtService.verifyToken(token);
        if (!userId) {
            throw new UnauthorizedException('Unauthorized');
        }

        request.userId = userId;
        return true;
    }
}