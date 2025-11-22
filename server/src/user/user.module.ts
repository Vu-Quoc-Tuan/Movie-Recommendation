import { Module } from '@nestjs/common';
import {KvStoreModule} from "../common/kv-store/kv-store.module.js";
import {SupabaseModule} from "../common/supabase/supabase.module.js";
import {UserController} from "./user.controller.js";
import {UserService} from "./user.service.js";
import {JwtModule} from "../common/jwt/jwt.module.js";

@Module({
  imports: [KvStoreModule, SupabaseModule, JwtModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}