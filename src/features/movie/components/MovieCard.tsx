import { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import { EmotionSpectrum } from '../../emotion/components/EmotionSpectrum';
import { MovieDetail } from './MovieDetail';
import { ImageWithFallback } from '../../../components/shared/ImageWithFallback';
import {Movie} from "../types/movie.types";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer"
        onClick={() => {
          setShowDetail(true)
        }

        }
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Poster */}
        <div className="relative h-64 overflow-hidden">
          <ImageWithFallback
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-white">{movie.rating}</span>
          </div>

          {/* Tooltip on Hover */}
          {showTooltip && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-end p-4">
              <div className="text-white text-sm">
                <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
                {movie.whyFitsVibe}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="mb-1 line-clamp-2">{movie.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{movie.year}</p>

          {/* Mini Emotion Spectrum */}
          <div className="mb-3">
            <EmotionSpectrum spectrum={movie.spectrum} mini />
          </div>

          {/* Vibe Tags */}
          <div className="flex flex-wrap gap-1">
            {movie.vibes.slice(0, 3).map((vibe, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full"
              >
                {vibe}
              </span>
            ))}
          </div>
        </div>
      </div >

      {/* Movie Detail Modal */}
      {
        showDetail && (
          <MovieDetail movie={movie} onClose={() => setShowDetail(false)} />
        )
      }
    </>
  );
}
