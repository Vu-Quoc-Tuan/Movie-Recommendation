import { Module } from '@nestjs/common';
import {KvStoreModule} from "../common/kv-store/kv-store.module.js";
import {JwtModule} from "../common/jwt/jwt.module.js";
import {LoggingController} from "./logging.controller.js";
import {LoggingService} from "./logging.service.js";


@Module({
  imports: [KvStoreModule, JwtModule],
  controllers: [LoggingController],
  providers: [LoggingService],
})
export class LoggingModule {}