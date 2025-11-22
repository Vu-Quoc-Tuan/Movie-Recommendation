import { Injectable } from '@nestjs/common';
import {SupabaseService} from "../supabase/supabase.service.js";


@Injectable()
export class EmbeddingService {
    private readonly clovaApiKey: string;

    constructor(private readonly supabaseService: SupabaseService) {
        this.clovaApiKey = process.env.CLOVA_API_KEY!;
    }

    async embeddingAPI(userInput: string): Promise<{ embedding: number[] } | null> {
        try {
            const response = await fetch(
                'https://clovastudio.stream.ntruss.com/v1/api-tools/embedding/v2/',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.clovaApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: userInput }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Clova API error:', response.status, response.statusText);
                console.error('Error details:', errorText);
                return null;
            }

            const result = await response.json();
            console.log('📦 Full response:', JSON.stringify(result, null, 2));

            if (result.status?.code !== '20000') {
                console.error('❌ API returned error:', result.status?.message);
                return null;
            }

            const embedding: number[] | undefined = result.result?.embedding;

            if (!embedding) {
                console.error('❌ No embedding in response');
                return null;
            }

            return { embedding };
        } catch (error: any) {
            console.error('❌ Error calling Clova:', error.message);
            console.error('Stack:', error.stack);
            return null;
        }
    }

    async searchSimilar(embedding: number[], limit: number = 10): Promise<any> {
        try {
            const supabase = this.supabaseService.getClient();
            const { data, error } = await supabase.rpc('search_movie', {
                query_embedding: embedding,
                match_threshold: 0.2,
                match_count: limit,
            });
            if (error) {
                console.error('❌ Supabase RPC error:', error.message);
                return [];
            }
            return data;
        } catch (error: any) {
            console.error('❌ Error querying Supabase:', error.message);
            return [];
        }
    }
}