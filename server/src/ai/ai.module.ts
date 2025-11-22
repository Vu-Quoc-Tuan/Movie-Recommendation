import { Module } from '@nestjs/common';
import {SupabaseModule} from "../common/supabase/supabase.module.js";
import {AiController} from "./ai.controller.js";
import {AiService} from "./ai.service.js";
import {CommonAiModule} from "../common/ai/ai.module.js";

@Module({
    imports: [CommonAiModule, SupabaseModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule {}