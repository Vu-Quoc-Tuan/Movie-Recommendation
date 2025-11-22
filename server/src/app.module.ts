import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {AuthModule} from "./auth/auth.module.js";
import {UserModule} from "./user/user.module.js";
import {RecommendationModule} from "./recommendation/recommendation.module.js";
import {PartyModule} from "./party/party.module.js";
import {LoggingModule} from "./logging/logging.module.js";
import {AppController} from "./app.controller.js";
import {AiModule} from "./ai/ai.module.js";
import {MovieModule} from "./movie/movie.module.js";



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường sẽ có sẵn trong toàn bộ ứng dụng
      // ignoreEnvFile: true, // Bỏ comment nếu bạn KHÔNG muốn dùng file .env
    }),
    AuthModule,
    UserModule,
    RecommendationModule,
    PartyModule,
    LoggingModule,
    AiModule,
    MovieModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}