import { Injectable, UnauthorizedException } from '@nestjs/common';
import {SupabaseService} from "../common/supabase/supabase.service.js";
import {JwtService} from "../common/jwt/jwt.service.js";



@Injectable()
export class RecommendationService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly jwtService: JwtService,
    ) {}

    async getPersonalRecommendations(userId: string) {
        const supabase = this.supabaseService.getClient();

        // 1. Get User History (Last 5 movies) with their moods
        const { data: history, error: historyError } = await supabase
            .from('user_history')
            .select(`
        movie_id,
        movies (
          id,
          mood
        )
      `)
            .eq('user_id', userId)
            .order('watched_at', { ascending: false })
            .limit(5);

        if (historyError) {
            console.error('History fetch error:', historyError);
            throw historyError;
        }

        // 1b. Get ALL watched movie IDs to exclude them
        const { data: allWatched, error: watchedError } = await supabase
            .from('user_history')
            .select('movie_id')
            .eq('user_id', userId);

        const allWatchedIds = allWatched ? allWatched.map((h: any) => h.movie_id) : [];
        console.log(`User ${userId} has watched ${allWatchedIds.length} movies.`);
        console.log('Watched IDs to exclude:', allWatchedIds);

        // Helper to get random movies excluding watched
        const getRandomMovies = async (limit: number, excludeIds: string[]) => {
            console.log(`Getting random movies, excluding ${excludeIds.length} watched IDs`);
            let q = supabase.from('movies').select('*');
            if (excludeIds.length > 0) {
                // Format for PostgREST: ("id1","id2","id3")
                const formattedIds = `(${excludeIds.map((id) => `"${id}"`).join(',')})`;
                q = q.not('id', 'in', formattedIds);
            }
            const { data, error } = await q.limit(limit);
            if (error) {
                console.error('Random movies query error:', error);
            }
            console.log(`Random movies returned: ${data?.length || 0} movies`);
            return data || [];
        };

        if (!history || history.length === 0) {
            // Fallback for new users
            return await getRandomMovies(10, allWatchedIds);
        }

        // 2. Extract Moods
        // Log each movie's mood for debugging
        console.log('Recent 5 movies with their moods:');
        history.forEach((h: any, index: number) => {
            console.log(
                `  ${index + 1}. Movie ID: ${h.movie_id}, Mood: ${JSON.stringify(h.movies?.mood || null)}`,
            );
        });

        // Flatten all moods from the history and remove duplicates
        const allMoods = history
            .flatMap((h: any) => h.movies?.mood || [])
            .filter((m: string) => m); // Filter out null/undefined/empty

        const uniqueMoods = [...new Set(allMoods)];

        console.log('User recent moods (unique):', uniqueMoods);

        if (uniqueMoods.length === 0) {
            // If no moods found in history, fallback to random (excluding watched)
            console.log('No moods found, returning random movies');
            return await getRandomMovies(10, allWatchedIds);
        }

        // 3. Find similar movies based on Mood Tags
        // We look for movies that have at least one of the mood tags
        // And exclude movies the user has already watched
        console.log('Searching for movies with moods:', uniqueMoods);
        let query = supabase
            .from('movies')
            .select('*')
            .overlaps('mood', uniqueMoods); // Requires 'mood' column to be TEXT[]

        // Exclude watched movies if any
        if (allWatchedIds.length > 0) {
            // Format for PostgREST: ("id1","id2","id3")
            const formattedIds = `(${allWatchedIds.map((id) => `"${id}"`).join(',')})`;
            query = query.not('id', 'in', formattedIds);
        }

        const { data: recommendations, error: recError } = await query.limit(10);

        if (recError) {
            console.error('Recommendation search error:', recError);
            // Fallback to random only on error
            return await getRandomMovies(10, allWatchedIds);
        }

        console.log(`Found ${recommendations?.length || 0} movies matching mood tags`);

        // If recommendations are empty (e.g. watched all matching mood movies), fallback to random
        if (!recommendations || recommendations.length === 0) {
            console.log('No mood-matched movies found, returning random movies');
            return await getRandomMovies(10, allWatchedIds);
        }

        return recommendations;
    }
    
    async getRandomRecommendations() {
        console.log('🎲 [getRandomRecommendations] Getting random movies for non-logged-in user');
        
        const supabase = this.supabaseService.getClient();
        
        // Get 10 random movies
        const { data: movies, error } = await supabase
            .from('movies')
            .select('*')
            .limit(10);
    
        if (error) {
            console.error('❌ [getRandomRecommendations] Error fetching random movies:', error);
            throw error;
        }
    
        console.log(`✅ [getRandomRecommendations] Found ${movies?.length || 0} random movies`);
        return movies || [];
    }
}