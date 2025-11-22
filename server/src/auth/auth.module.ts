import { Module } from '@nestjs/common';
import {KvStoreModule} from "../common/kv-store/kv-store.module.js";
import {SupabaseModule} from "../common/supabase/supabase.module.js";
import {AuthController} from "./auth.controller.js";
import {AuthService} from "./auth.service.js";
import {JwtModule} from "../common/jwt/jwt.module.js";


@Module({
  imports: [KvStoreModule, SupabaseModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}