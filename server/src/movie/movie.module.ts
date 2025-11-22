import { Module } from '@nestjs/common';
import {SupabaseModule} from "../common/supabase/supabase.module.js";
import {MovieController} from "./movie.controller.js";
import {MovieService} from "./movie.service.js";
import {JwtModule} from "../common/jwt/jwt.module.js";


@Module({
  imports: [SupabaseModule,JwtModule],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}