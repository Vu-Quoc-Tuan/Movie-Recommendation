import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { MovieDetail } from './MovieDetail';
import {Movie} from "../../features/movie/types/movie.types";
import {fetchMoodPicks} from "../../features/movie/api/movieApi";

export function MoodCarousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [movie, setMovie] = useState<Movie>()
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadMoodMovies = async () => {
      const moodMovies = await fetchMoodPicks();
      setMovies(moodMovies);
    };
    loadMoodMovies();
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, movies.length - 3));
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length - 3) % Math.max(1, movies.length - 3));
  };

  if (movies.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse h-64" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                setShowDetail(true)
                setMovie(movie)
              }}
              className="min-w-[calc(100%-1rem)] sm:min-w-[calc(50%-0.5rem)] md:min-w-[calc(33.333%-0.667rem)] lg:min-w-[calc(25%-0.75rem)]"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white mb-1">{movie.title}</h3>
                    <p className="text-xs text-white/80">{movie.year}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-xs text-white">{movie.rating}</span>
                      </div>
                      {movie.vibes.slice(0, 2).map((vibe, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-purple-500/80 text-white rounded-full"
                        >
                          {vibe}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDetail && <MovieDetail movie={movie} onClose={() => setShowDetail(false)} />}

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}
