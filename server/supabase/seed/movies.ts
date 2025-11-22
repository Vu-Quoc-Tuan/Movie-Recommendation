import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../.env') });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_PROJECT_ID) {
  throw new Error('SUPABASE_PROJECT_ID not found. Set it in .env file.');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found. Set it in .env file.');
}

const supabaseUrl = SUPABASE_PROJECT_ID.includes('http') 
  ? SUPABASE_PROJECT_ID 
  : `https://${SUPABASE_PROJECT_ID}.supabase.co`;

// ✅ Dùng SERVICE_ROLE_KEY để bypass RLS khi seed data
export const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// TMDb API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Genre mapping from TMDb genre IDs to Vietnamese names
const GENRE_MAP: Record<number, string> = {
  28: 'Hành động',
  12: 'Phiêu lưu',
  16: 'Hoạt hình',
  35: 'Hài',
  80: 'Hình sự',
  99: 'Tài liệu',
  18: 'Chính kịch',
  10751: 'Gia đình',
  14: 'Giả tưởng',
  36: 'Lịch sử',
  27: 'Kinh dị',
  10402: 'Âm nhạc',
  9648: 'Bí ẩn',
  10749: 'Tình cảm',
  878: 'Khoa học viễn tưởng',
  10770: 'Phim truyền hình',
  53: 'Gây cấn',
  10752: 'Chiến tranh',
  37: 'Miền Tây',
};

// Country mapping from language codes
const COUNTRY_MAP: Record<string, string> = {
  en: 'Mỹ',
  vi: 'Việt Nam',
  ko: 'Hàn Quốc',
  ja: 'Nhật Bản',
  zh: 'Trung Quốc',
  fr: 'Pháp',
  de: 'Đức',
  es: 'Tây Ban Nha',
  it: 'Ý',
  th: 'Thái Lan',
  hi: 'Ấn Độ',
};

interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  genre_ids: number[];
  poster_path: string | null;
  release_date: string;
  original_language: string;
}

interface TMDbVideo {
  key: string;
  site: string;
  type: string;
}

async function fetchPopularMovies(): Promise<TMDbMovie[]> {
  try {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
      throw new Error('TMDb API key is missing. Set the TMDB_API_KEY environment variable before running the seed.');
    }
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=vi-VN&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results.slice(0, 10); // Get first 10 movies
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
}

async function fetchMovieTrailer(movieId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const trailer = data.results.find(
      (video: TMDbVideo) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch (error) {
    console.error(`Error fetching trailer for movie ${movieId}:`, error);
    return null;
  }
}

function mapGenreIds(genreIds: number[]): string[] {
  return genreIds.map(id => GENRE_MAP[id] || 'Khác').filter(Boolean);
}

function getCountryFromLanguage(language: string): string {
  return COUNTRY_MAP[language] || 'Khác';
}

async function seedMovies() {
  console.log('🎬 Starting movie seed...\n');

  // Check connection
  console.log('Testing Supabase connection...');
  const { error: connectionError } = await supabase.from('movies').select('count').limit(1);

  if (connectionError) {
    console.error('❌ Connection error:', connectionError.message);
    return;
  }
  console.log('✓ Connected to Supabase\n');

  // Fetch movies from TMDb
  console.log('Fetching movies from TMDb...');
  const tmdbMovies = await fetchPopularMovies();
  console.log(`✓ Fetched ${tmdbMovies.length} movies\n`);

  // Process and insert movies
  let successCount = 0;
  let errorCount = 0;

  for (const movie of tmdbMovies) {
    try {
      console.log(`Processing: ${movie.title}...`);

      // Fetch trailer
      const youtubeLink = await fetchMovieTrailer(movie.id);

      // Prepare movie data
      const movieData = {
        title: movie.title,
        genre: mapGenreIds(movie.genre_ids),
        country: getCountryFromLanguage(movie.original_language),
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
        movie_overview: movie.overview || 'Chưa có mô tả',
        youtube_link: youtubeLink,
        poster_url: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      };

      // Insert into Supabase
      const { error } = await supabase.from('movies').insert(movieData);

      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`  ✓ Inserted successfully`);
        successCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 250));

    } catch (error) {
      console.error(`  ❌ Failed to process: ${error}`);
      errorCount++;
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`✓ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`Total: ${tmdbMovies.length}`);
}

// Run seed
seedMovies()
  .then(() => {
    console.log('\n✨ Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
