import { Module } from '@nestjs/common';
import {KvStoreService} from "./kv-store.service.js";


@Module({
    providers: [KvStoreService],
    exports: [KvStoreService],
})
export class KvStoreModule {}