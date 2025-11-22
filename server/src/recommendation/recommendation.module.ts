import { Module } from '@nestjs/common';
import {SupabaseModule} from "../common/supabase/supabase.module.js";
import {RecommendationController} from "./recommendation.controller.js";
import {JwtModule} from "../common/jwt/jwt.module.js";
import {RecommendationService} from "./recommendation.service.js";


@Module({
  imports: [SupabaseModule, JwtModule],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}