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