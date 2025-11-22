import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { embeddingAPI } from '../../server/lib/api/apiCharactor';
import { text } from 'stream/consumers';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const BATCH_SIZE = 200;
const SLEEP_MS = 8000; 
const MAX_RETRIES = 5; 

// ================== SUPABASE CLIENT ==================
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type MovieRow = {
  id: number;
  movie_overview: string | null;
  embedding: number[] | null;
};

// ================== HELPER ==================
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDescription = (movie: MovieRow): string => {
  if (movie.movie_overview) {
    return movie.movie_overview.slice(0, 500);
  }
  if ((movie as any).description) {
    return (movie as any).description.slice(0, 500);
  }
  return '';
};

async function getEmbeddingFromLLM(movie: MovieRow, retries = 0): Promise<number[] | null> {
  const description = getDescription(movie);

  const movieInfo = `Description: ${description}`;

  try {

    const res = await embeddingAPI(movieInfo);

    if (!res) {
        console.warn(`⏳ Model maybe overloaded. with movie ${movie.id}, retry after 10s...`);
        await sleep(10000);
        return getEmbeddingFromLLM(movie, retries + 1);      
    }

    const embedding = await res.embedding;
    console.log(`✓ Response length: ${embedding.length} chars`);
    return embedding;

  } catch (err: any) {
    console.error(`Error calling LLM for movie ${movie.id}:`, err.message || err);
    return null;
  }
}

async function updateMovieEmbedding(movieId: number, embedding: number[]) {
  const { error } = await supabase
    .from('movies')
    .update({ embedding })
    .eq('id', movieId);

  if (error) {
    console.error(`Failed to update embedding for movie ${movieId}:`, error.message);
  } else {
    console.log(`✅ Updated movie ${movieId} with embedding.`);
  }
}

async function fetchMoviesWithoutEmbedding(limit: number): Promise<MovieRow[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('id, movie_overview, embedding')  
    .is('embedding', null)
    .not('movie_overview', 'is', null)
    .neq('movie_overview', 'Chưa có mô tả')
    .limit(limit);

  if (error) {
    console.error('Error fetching movies:', error.message);
    return [];
  }

  return data as MovieRow[];
}

// ================== MAIN PIPELINE ==================
async function main() {
  console.log('🚀 Start filling movie Embeddings...');

  while (true) {
    const movies = await fetchMoviesWithoutEmbedding(BATCH_SIZE);

    if (movies.length === 0) {
      console.log('🎉 Done! No more movies without embedding.');
      break;
    }

    console.log(`🔹 Found ${movies.length} movies without embedding. Processing...`);
    for (const movie of movies) {
      console.log(`\n--- Movie ID: ${movie.id} | Title: ${movie.movie_overview?.slice(0, 30)}... ---`);

      const embedding = await getEmbeddingFromLLM(movie);
      if (!embedding) {
        console.warn(`⚠️ Skip movie ${movie.movie_overview?.slice(0, 30)}... (no embedding returned)`);
        continue;
      }

      await updateMovieEmbedding(movie.id, embedding);
      await sleep(SLEEP_MS);
    }
  }

  console.log('✅ Pipeline finished.');
}

main().catch((err) => {
  console.error('Pipeline crashed:', err);
  process.exit(1);
});