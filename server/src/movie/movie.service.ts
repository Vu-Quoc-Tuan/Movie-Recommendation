import { Injectable } from '@nestjs/common';
import {SupabaseService} from "../common/supabase/supabase.service.js";
import {FetchMoviesDto} from "./dto/fetch-movies.dto.js";


@Injectable()
export class MovieService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async fetchMovies(fetchMoviesDto: FetchMoviesDto) {
    const {
      search,
      yearMin,
      yearMax,
      ratingMin,
      genres,
      regions,
      sort = 'newest',
      page = 1,
    } = fetchMoviesDto;

    const supabase = this.supabaseService.getClient();
    let query = supabase.from('movies').select('*');

    // Search by title
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Filter by year range
    if (yearMin !== undefined) {
      query = query.gte('year', yearMin);
    }
    if (yearMax !== undefined) {
      query = query.lte('year', yearMax);
    }

    // Filter by rating
    if (ratingMin !== undefined) {
      query = query.gte('rating', ratingMin);
    }

    // Filter by genre (assuming genre is an array column)
    if (genres && genres.length > 0) {
      // Use overlaps for array column
      query = query.overlaps('genre', genres);
    }

    // Filter by country/region
    if (regions && regions.length > 0) {
      query = query.in('country', regions);
    }

    // Sorting
    switch (sort) {
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
        query = query.order('year', { ascending: false });
    }

    // Pagination (24 items per page)
    const pageSize = 24;
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching movies:', error);
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }

    return data || [];
  }

  async fetchMoodPicks(userId?: string) {
    const supabase = this.supabaseService.getClient();

    // If user is logged in, try to get personal recommendations
    if (userId) {
      try {
        // Get user's watched movies to exclude
        const { data: watchedData } = await supabase
          .from('user_history')
          .select('movie_id')
          .eq('user_id', userId);

        const watchedIds = watchedData?.map((h: any) => h.movie_id) || [];

        // Get random movies excluding watched ones
        let query = supabase.from('movies').select('*');
        
        if (watchedIds.length > 0) {
          const formattedIds = `(${watchedIds.map((id: string) => `"${id}"`).join(',')})`;
          query = query.not('id', 'in', formattedIds);
        }

        const { data, error } = await query.limit(10);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (error) {
        console.error('Error fetching personal mood picks:', error);
        // Fall through to random movies
      }
    }

    // Fallback: Get random movies (limit 10)
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching mood picks:', error);
      throw new Error(`Failed to fetch mood picks: ${error.message}`);
    }

    return data || [];
  }
}