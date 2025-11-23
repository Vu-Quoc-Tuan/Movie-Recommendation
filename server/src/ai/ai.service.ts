import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AnalyzeEmotionalJourneyDto } from "./dto/analyze-emotional-journey.dto.js";
import { AnalyzePartyMoodDto } from "./dto/analyze-party-mood.dto.js";
import { AnalyzeCharacterMatchDto } from "./dto/analyze-character-match.dto.js";
import { ClovaAIService } from "../common/ai/clova-ai.service.js";
import { EmbeddingService } from "../common/ai/embedding.service.js";
import { SupabaseService } from "../common/supabase/supabase.service.js";


@Injectable()
export class AiService {
    constructor(
        private readonly clovaAI: ClovaAIService,
        private readonly embeddingService: EmbeddingService,
        private readonly supabaseService: SupabaseService,
    ) { }

    async charactorAnalyze(moodText: string): Promise<any> {
        const embeddingInput = await this.embeddingService.embeddingAPI(moodText);
        if (!embeddingInput) {
            throw new Error('Failed to get embedding from API');
        }
        const movies = await this.embeddingService.searchSimilar(
            embeddingInput.embedding,
            10,
        );
        return movies;
    }

    async analyzeMovies(moviesData: any[], moodTextGroup: string) {
        const list = [];

        for (const movie of moviesData) {
            const userInput =
                moodTextGroup +
                '\n\n---\nThông tin phim:\n' +
                JSON.stringify(movie);

            const aiScore = await this.clovaAI.apiHelper(userInput, 1);

            list.push({
                movieId: movie.id,
                movieTitle: movie.title,
                aiScore,
            });
        }

        return list;
    }

    async analyzeCharacters(moviesData: any[], moodText: string) {
        const list = [];

        for (const movie of moviesData) {
            const userInput =
                `${moodText}\n\n---\nThông tin nhân vật:\n` + JSON.stringify(movie);

            const aiScore = await this.clovaAI.apiHelper(userInput, 2); // 2 = character matching

            list.push({
                movieId: movie.id,
                aiScore,
            });
        }

        return list;
    }

    async analyzeEmotionalJourney(dto: AnalyzeEmotionalJourneyDto) {
        const { moodText } = dto;

        if (!moodText || !moodText.trim()) {
            throw new BadRequestException('Mood text is required');
        }

        // Call Clova AI
        const analysis = await this.clovaAI.callClovaMood(moodText, 'single');

        const top3 = analysis.top_3; // ["sad", "healing", "lonely"]

        if (!top3 || top3.length === 0) {
            throw new Error('No top_3 moods returned from AI');
        }

        const supabase = this.supabaseService.getClient();
        // Query 3 phim tương ứng với top3 moods, rating cao nhất
        const { data: moviesData, error: moviesError } = await supabase
            .from('movies')
            .select('id, title, year, genre, poster_url, movie_overview, rating, mood')
            .overlaps('mood', top3) // dùng .overlaps trực tiếp, không dùng .filter
            .order('rating', { ascending: false })
            .limit(3);

        if (moviesError) {
            console.error('Supabase movies error:', moviesError);
            throw moviesError;
        }

        // Nếu không đủ 3 phim, vẫn gán nhưng có thể null
        const journey = {
            release: moviesData?.[0] || null,
            reflect: moviesData?.[1] || null,
            rebuild: moviesData?.[2] || null,
        };

        return journey;
    }

    async analyzePartyMood(dto: AnalyzePartyMoodDto) {
        const { members } = dto;

        if (!members || !Array.isArray(members) || members.length < 2) {
            throw new BadRequestException('Party requires 2-4 members');
        }

        // Convert members → moodTextGroup
        const moodTextGroup = members
            .map((m) => {
                const main = `${m.name} đang cảm thấy ${m.mood}`;
                const extra = m.moodText ? ` và chia sẻ rằng: "${m.moodText}"` : '';
                return `- ${main}${extra}`;
            })
            .join('\n');

        // Call Clova AI
        const analysis = await this.clovaAI.callClovaMood(moodTextGroup, 'party');
        const top3 = analysis.top_3;

        if (!top3 || top3.length === 0) {
            throw new Error('No top_3 moods returned from AI');
        }

        const supabase = this.supabaseService.getClient();
        // Lấy 2 phim
        const { data: moviesData, error: moviesError } = await supabase
            .from('movies')
            .select('id, title, year, genre, poster_url, movie_overview, rating, mood')
            .overlaps('mood', top3)
            .order('rating', { ascending: false })
            .limit(2);

        if (moviesError) throw moviesError;

        // Phân tích từng phim
        const movieAnalysis = await this.analyzeMovies(moviesData, moodTextGroup);

        // Merge luôn vào recommendations
        const mergedData = moviesData.map((movie) => {
            const ai = movieAnalysis.find((a) => a.movieId === movie.id);
            return {
                ...movie,
                analysis: ai?.aiScore || null,
            };
        });

        return {
            recommendations: mergedData,
        };
    }

    async analyzeCharacterMatch(dto: AnalyzeCharacterMatchDto) {
        const { moodText } = dto;

        if (!moodText || !moodText.trim()) {
            throw new BadRequestException('Mood text is required');
        }

        const analysis = await this.charactorAnalyze(moodText);

        // Get character match list
        const matchList = await this.analyzeCharacters(analysis, moodText);
        if (!matchList || matchList.length === 0) {
            throw new NotFoundException('No character matches found');
        }

        // Find movie with highest match_score
        const validMatches = matchList.filter(
            (m) => m.aiScore && typeof m.aiScore.match_score === 'number',
        );

        if (validMatches.length === 0) {
            throw new NotFoundException('No valid character matches found');
        }

        const bestMatch = validMatches.reduce((prev, curr) => {
            return curr.aiScore!.match_score! > prev.aiScore!.match_score! ? curr : prev;
        }, validMatches[0]);

        const supabase = this.supabaseService.getClient();
        // Query Supabase for movie details
        const { data: movieData, error: movieError } = await supabase
            .from('movies')
            .select('title, year, poster_url, rating, mood')
            .eq('id', bestMatch.movieId)
            .single();

        if (movieError) {
            console.error('❌ Supabase error fetching movie:', movieError);
        }

        // Merge movie details into bestMatch
        const result = {
            ...bestMatch,
            movie: movieData || null,
        };

        return result;
    }
}