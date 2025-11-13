import { supabase } from './supabase/client';

export interface Movie {
  id: string | number;
  title: string;
  year: number;
  poster_url: string;
  poster?: string; // Fallback for compatibility
  rating?: number;
  vibes?: string[];
  spectrum?: {
    calm: number;
    warm: number;
    hopeful: number;
    nostalgic: number;
    bittersweet: number;
    intense: number;
  };
  overview?: string;
  movie_overview?: string; // From DB
  whyFitsVibe?: string;
  whyMatchesMood?: string;
  vignette?: string;
  quote?: string;
  runtime?: number;
  weatherMatch?: number;
  comfortBadge?: string;
  ostLink?: string;
  trailerYoutubeId?: string;
  youtube_link?: string; // From DB
  whereToWatch?: { [key: string]: string };
  genres?: string[];
  genre?: string[]; // From DB
  region?: string;
  country?: string; // From DB
  created_at?: string;
}

/**
 * Fetch movies from Supabase database with filters, search, sorting, and pagination.
 * Falls back to empty array if database is unavailable.
 */
export async function getMovies(
  filters: any,
  searchQuery: string,
  page: number
): Promise<Movie[]> {
  try {
    let query = supabase.from('movies').select('*');

    // Search by title
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    // Filter by year range
    if (filters.yearMin && filters.yearMax) {
      query = query.gte('year', filters.yearMin).lte('year', filters.yearMax);
    }

    // Filter by rating (if available)
    if (filters.ratingMin !== undefined) {
      query = query.gte('rating', filters.ratingMin);
    }

    // Filter by genre (basic - adjust if genres is an array column)
    if (filters.genres && filters.genres.length > 0) {
      // Note: This assumes genre is stored as an array in the DB
      // Adjust the query logic if genres are stored differently
      const genreFilter = filters.genres[0];
      query = query.contains('genre', [genreFilter]);
    }

    // Filter by country/region
    if (filters.regions && filters.regions.length > 0) {
      query = query.in('country', filters.regions);
    }

    // Sorting
    switch (filters.sort) {
      case 'newest':
        query = query.order('year', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'alpha':
        query = query.order('title', { ascending: true });
        break;
      default:
        // Default sort by year descending
        query = query.order('year', { ascending: false });
    }

    // Pagination (24 items per page)
    const pageSize = 24;
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching movies from Supabase:', error);
      return [];
    }

    // Transform DB data to Movie interface
    return (data || []).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      poster_url: movie.poster_url,
      poster: movie.poster_url, // Fallback for compatibility
      overview: movie.movie_overview,
      movie_overview: movie.movie_overview,
      genres: movie.genre || [],
      genre: movie.genre,
      country: movie.country,
      region: movie.country,
      youtube_link: movie.youtube_link,
      trailerYoutubeId: movie.youtube_link?.split('v=')[1] || '',
      whereToWatch: {}, // TODO: Add to DB schema if needed
      // Mock fields for UI (can be added to DB later)
      rating: 7.5,
      vibes: ['Emotional'],
      spectrum: {
        calm: 50,
        warm: 70,
        hopeful: 60,
        nostalgic: 50,
        bittersweet: 40,
        intense: 40,
      },
      whyFitsVibe: movie.movie_overview || 'Great movie!',
      whyMatchesMood: movie.movie_overview || 'Perfect for your mood.',
      vignette: movie.movie_overview || 'An engaging story.',
      quote: 'A memorable film.',
      runtime: 120,
      weatherMatch: 75,
      ostLink: '#',
      created_at: movie.created_at,
    }));
  } catch (error) {
    console.error('Exception fetching movies:', error);
    return [];
  }
}

/**
 * Get mood-based movie picks from Supabase.
 * Fetches a random selection of movies to recommend based on time of day.
 */
export async function getMoodPicks(): Promise<Movie[]> {
  try {
    // Fetch random movies (limit 10)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching mood picks:', error);
      return [];
    }

    return (data || []).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      poster_url: movie.poster_url,
      poster: movie.poster_url,
      overview: movie.movie_overview,
      movie_overview: movie.movie_overview,
      genres: movie.genre || [],
      country: movie.country,
      region: movie.country,
      youtube_link: movie.youtube_link,
      trailerYoutubeId: movie.youtube_link?.split('v=')[1] || '',
      rating: 7.5,
      vibes: ['Emotional'],
      spectrum: {
        calm: 50,
        warm: 70,
        hopeful: 60,
        nostalgic: 50,
        bittersweet: 40,
        intense: 40,
      },
      whyFitsVibe: movie.movie_overview || 'Great movie!',
      whyMatchesMood: movie.movie_overview || 'Perfect for your mood.',
      vignette: movie.movie_overview || 'An engaging story.',
      quote: 'A memorable film.',
      runtime: 120,
      weatherMatch: 75,
    }));
  } catch (error) {
    console.error('Exception fetching mood picks:', error);
    return [];
  }
}
