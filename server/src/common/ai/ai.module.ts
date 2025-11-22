import { Module } from '@nestjs/common';
import {SupabaseModule} from "../supabase/supabase.module.js";
import {ClovaAIService} from "./clova-ai.service.js";
import {EmbeddingService} from "./embedding.service.js";
import {ClovaSTTService} from "./clova-stt.service.js";


@Module({
    imports: [SupabaseModule],
    providers: [ClovaAIService, EmbeddingService, ClovaSTTService],
    exports: [ClovaAIService, EmbeddingService, ClovaSTTService],
})
export class CommonAiModule {}