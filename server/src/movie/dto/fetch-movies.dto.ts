export class FetchMoviesDto {
    search?: string;
    yearMin?: number;
    yearMax?: number;
    ratingMin?: number;
    genres?: string[];
    regions?: string[];
    sort?: 'newest' | 'rating' | 'alpha';
    page?: number;
  }