import { supabase } from '../../../lib/supabase/client';
import { Movie } from "../types/movie.types";
import { getApiEndpoint } from '../../../lib/api/apiClient';
import generateRandomSpectrum from '../../../lib/helper/randomSpectrum';

/**
 * Fetch movies from Supabase database with filters, search, sorting, and pagination.
 * Falls back to empty array if database is unavailable.
 */
export async function fetchMovies(
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
    return (data || []).map(mapToMovie);
  } catch (error) {
    console.error('Exception fetching movies:', error);
    return [];
  }
}

/**
 * Get mood-based movie picks from Supabase.
 * Fetches a random selection of movies to recommend based on time of day.
 */
export async function fetchMoodPicks(): Promise<Movie[]> {
  try {
    // 1. Check if user is logged in via localStorage
    const token = localStorage.getItem('cine_token');

    if (token) {
      // 2. Call Backend Recommendation Endpoint
      try {
        const response = await fetch(getApiEndpoint('/recommend/personal'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Body can be empty or contain extra params
        });

        if (response.ok) {
          const recommendations = await response.json();
          if (recommendations && recommendations.length > 0) {
            return (recommendations || []).map(mapToMovie);
          }
        } else {
          console.warn('Recommendation API returned error:', response.status);
        }
      } catch (err) {
        console.error('Error fetching personal recommendations:', err);
      }
    }

    // Fallback: Fetch random movies (limit 10)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching mood picks:', error);
      return [];
    }

    return (data || []).map(mapToMovie);
  } catch (error) {
    console.error('Exception fetching mood picks:', error);
    return [];
  }
}

/**
 * Add a movie to user's watch history
 */
export async function addToHistory(movieId: string) {
  const token = localStorage.getItem('cine_token');

  if (!token) {
    console.warn('User not logged in, cannot save history');
    return;
  }

  try {
    const response = await fetch(getApiEndpoint('/user/history'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movie_id: movieId })
    });

    if (!response.ok) {
      throw new Error(`Failed to add history: ${response.statusText}`);
    }

    console.log('Successfully added to history:', movieId);
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

// Helper to extract YouTube ID
function getYoutubeId(url: string | null | undefined): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

// Helper to map DB result to Movie type
function mapToMovie(movie: any): Movie {
  // Construct whereToWatch based on available data
  const whereToWatch: Record<string, string> = {};

  if (movie.youtube_link) {
    whereToWatch['YouTube'] = movie.youtube_link;
  }

  // Mock data for testing if empty (Remove this in production if you have real data)
  if (Object.keys(whereToWatch).length === 0) {
    whereToWatch['Netflix'] = 'https://www.netflix.com/search?q=' + encodeURIComponent(movie.title);
    whereToWatch['Google Play'] = 'https://play.google.com/store/search?c=movies&q=' + encodeURIComponent(movie.title);
  }

  const trailerId = getYoutubeId(movie.youtube_link);

  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    poster_url: movie.poster_url,
    poster: movie.poster_url,
    overview: movie.movie_overview,
    movie_overview: movie.movie_overview,
    genres: movie.genre || [],
    genre: movie.genre,
    country: movie.country,
    region: movie.country,
    youtube_link: movie.youtube_link,
    trailerYoutubeId: trailerId,
    whereToWatch: whereToWatch,
    rating: 7.5,
    vibes: movie.mood || ['Emotional'], // Map DB mood to vibes
    spectrum: generateRandomSpectrum(),
    whyFitsVibe: movie.movie_overview || 'Great movie!',
    whyMatchesMood: movie.movie_overview || 'Perfect for your mood.',
    vignette: movie.movie_overview || 'An engaging story.',
    quote: 'A memorable film.',
    runtime: 120,
    weatherMatch: 75,
    ostLink: '#',
    created_at: movie.created_at,
  };
}

function getTopGenres(genres: string[]): string[] {
  const counts: Record<string, number> = {};
  genres.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);
}

