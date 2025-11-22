import { Module } from '@nestjs/common';
import {SupabaseModule} from "../supabase/supabase.module.js";
import {ClovaAIService} from "./clova-ai.service.js";
import {EmbeddingService} from "./embedding.service.js";


@Module({
    imports: [SupabaseModule],
    providers: [ClovaAIService, EmbeddingService],
    exports: [ClovaAIService, EmbeddingService],
})
export class CommonAiModule {}