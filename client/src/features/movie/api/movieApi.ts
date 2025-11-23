import { Movie } from "../types/movie.types";
import { getApiEndpoint } from '../../../lib/api/apiClient';
import generateRandomSpectrum from '../../../lib/helper/randomSpectrum';

/**
 * Fetch movies from Supabase database with filters, search, sorting, and pagination.
 * Falls back to empty array if database is unavailable.
 */
export async function fetchMovies(
  filters: FetchMoviesParams['filters'],
  searchQuery: string,
  page: number
): Promise<Movie[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams();

    if (searchQuery) {
      params.append('search', searchQuery);
    }

    if (filters.yearMin !== undefined) {
      params.append('yearMin', filters.yearMin.toString());
    }

    if (filters.yearMax !== undefined) {
      params.append('yearMax', filters.yearMax.toString());
    }

    if (filters.ratingMin !== undefined) {
      params.append('ratingMin', filters.ratingMin.toString());
    }

    if (filters.genres && filters.genres.length > 0) {
      filters.genres.forEach(genre => params.append('genres', genre));
    }

    if (filters.regions && filters.regions.length > 0) {
      filters.regions.forEach(region => params.append('regions', region));
    }

    if (filters.sort) {
      params.append('sort', filters.sort);
    }

    params.append('page', page.toString());

    const response = await fetch(`${getApiEndpoint('/movies')}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch movies');
    }

    const data = await response.json();

    console.log("mo", data)

    // Transform DB data to Movie interface
    return (data || []).map(mapToMovie);
  } catch (error) {
    console.error('Exception fetching movies:', error);
    return [];
  }
}


/**
 * Get mood-based movie picks from NestJS backend.
 * Fetches personalized recommendations if user is logged in, otherwise returns empty array.
 */
export async function fetchMoodPicks(): Promise<Movie[]> {
  try {
    // 1. Check if user is logged in via localStorage
    const token = localStorage.getItem('cine_token');

    if (token) {
      // 2. Call Backend Recommendation Endpoint
      try {
        const response = await fetch(getApiEndpoint('recommend/personal'), {
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

    try {
      const response = await fetch(getApiEndpoint('recommend/random'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const randomMovies = await response.json();
        if (randomMovies && randomMovies.length > 0) {
          return (randomMovies || []).map(mapToMovie);
        }
      } else {
        console.warn('Random recommendation API returned error:', response.status);
      }
    } catch (err) {
      console.error('Error fetching random recommendations:', err);
    }

    // Return empty array if no token or recommendation failed
    // You can add a fallback to fetch random movies from API if needed
    return [];
  } catch (error) {
    console.error('Exception fetching mood picks:', error);
    return [];
  }
}

/**
 * Add a movie to user's watch history via NestJS backend
 */
export async function addToHistory(movieId: string) {
  const token = localStorage.getItem('cine_token');

  if (!token) {
    console.warn('User not logged in, cannot save history');
    return;
  }

  try {
    const response = await fetch(getApiEndpoint('user/history'), {
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

