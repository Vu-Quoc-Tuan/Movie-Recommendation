import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import callllm from './call_llm';

// ================== CONFIG ==================
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const BATCH_SIZE = 200;  // Giảm xuống 3
const SLEEP_MS = 8000;  // Tăng lên 8s (60s / 10 requests = 6s + buffer)
const MAX_RETRIES = 5;  // Tăng lên 5 lần retry

// ================== SUPABASE CLIENT ==================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type MovieRow = {
  id: number;
  title: string;
  genre: string | string[] | null;
  movie_overview: string | null;
  mood: string | null;
};

// ================== HELPER ==================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDescription = (movie: MovieRow): string => {
  if (movie.movie_overview) {
    // Giới hạn overview ở 500 ký tự để tránh quá dài
    return movie.movie_overview.slice(0, 500);
  }
  if ((movie as any).description) {
    return (movie as any).description.slice(0, 500);
  }
  return '';
};

const getGenreText = (genre: MovieRow['genre']): string => {
  if (Array.isArray(genre)) return genre.join(', ');
  if (typeof genre === 'string') return genre;
  return '';
};

async function getMoodFromLLM(movie: MovieRow, retries = 0): Promise<string[] | null> {  // Đổi return type thành string[]
  const genresText = getGenreText(movie.genre);
  const description = getDescription(movie);

  const movieInfo = `Title: ${movie.title}
Genres: ${genresText}
Description: ${description}`;

  try {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: movieInfo
    });

    const res = await callllm(request);

    if (!res.ok) {
      const errorText = await res.text();
      
      // Check if 429 quota error
      if (res.status === 500 && errorText.includes('429')) {
        if (retries < MAX_RETRIES) {
          console.warn(`⏳ Quota exceeded. Retry ${retries + 1}/${MAX_RETRIES} after 20s...`);
          await sleep(20000);
          return getMoodFromLLM(movie, retries + 1);
        }
      }
      
      if (res.status === 503 && retries < MAX_RETRIES) {
        console.warn(`⏳ Server overloaded. Retry ${retries + 1}/${MAX_RETRIES} after 10s...`);
        await sleep(10000);
        return getMoodFromLLM(movie, retries + 1);
      }
      
      console.error(`LLM error for movie ${movie.id}: HTTP ${res.status}`);
      return null;
    }

    const text = await res.text();
    
    console.log(`✓ Response length: ${text.length} chars`);
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      console.error(`JSON parse error for movie ${movie.id}:`, text.slice(0, 200));
      return null;
    }
    
    const top3 = result.top_3;
    
    if (!top3 || !Array.isArray(top3) || top3.length === 0) {
      console.warn(`No top_3 found in response for movie ${movie.id}`);
      return null;
    }

    // Trả về array thay vì join string
    return top3;  // ["dark", "scary", "sad"]
  } catch (err: any) {
    if (err.message?.includes('429') && retries < MAX_RETRIES) {
      console.warn(`⏳ Quota exceeded. Retry ${retries + 1}/${MAX_RETRIES} after 20s...`);
      await sleep(20000);
      return getMoodFromLLM(movie, retries + 1);
    }
    console.error(`Error calling LLM for movie ${movie.id}:`, err.message || err);
    return null;
  }
}

// Cập nhật function update để nhận array
async function updateMovieMood(movieId: number, mood: string[]) {  // Đổi type thành string[]
  const { error } = await supabase
    .from('movies')
    .update({ mood })  // Supabase tự convert array sang PostgreSQL array
    .eq('id', movieId);

  if (error) {
    console.error(`Failed to update mood for movie ${movieId}:`, error.message);
  } else {
    console.log(`✅ Updated movie ${movieId} with mood [${mood.join(', ')}]`);
  }
}

async function fetchMoviesWithoutMood(limit: number): Promise<MovieRow[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('id, title, genre, movie_overview, mood')  
    .is('mood', null)
    .limit(limit);

  if (error) {
    console.error('Error fetching movies:', error.message);
    return [];
  }

  return data as MovieRow[];
}

// ================== MAIN PIPELINE ==================
async function main() {
  console.log('🚀 Start filling movie moods...');

  while (true) {
    const movies = await fetchMoviesWithoutMood(BATCH_SIZE);

    if (movies.length === 0) {
      console.log('🎉 Done! No more movies without mood.');
      break;
    }

    console.log(`🔹 Found ${movies.length} movies without mood. Processing...`);

    for (const movie of movies) {
      console.log(`\n--- Movie ID: ${movie.id} | Title: ${movie.title}`);

      const mood = await getMoodFromLLM(movie);
      if (!mood) {
        console.warn(`⚠️ Skip movie ${movie.id} (no mood returned)`);
        continue;
      }

      await updateMovieMood(movie.id, mood);
      await sleep(SLEEP_MS);
    }
  }

  console.log('✅ Pipeline finished.');
}

main().catch((err) => {
  console.error('Pipeline crashed:', err);
  process.exit(1);
});