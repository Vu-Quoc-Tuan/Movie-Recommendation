import { useState, useRef } from 'react';
import { X, Play, Bookmark, Share2, Shield, Cloud, Clock, Download } from 'lucide-react';

import { EmotionSpectrum } from '../emotion/EmotionSpectrum';
import { useAuth, getAuthToken } from '../auth/AuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import html2canvas from 'html2canvas';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { getApiEndpoint } from '../../config/api';
import {Movie} from "../../features/movie/types/movie.types";

interface MovieDetailProps {
  movie: Movie;
  onClose: () => void;
}

export function MovieDetail({ movie, onClose }: MovieDetailProps) {
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu phim');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(
        getApiEndpoint('/user/save'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movie_id: movie.id }),
        }
      );

      if (response.ok) {
        setSaved(true);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDecide = async (platform: string) => {
    try {
      const token = getAuthToken() || publicAnonKey;
      await fetch(
        getApiEndpoint('/log/decide'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ movie_id: movie.id, platform }),
        }
      );

      window.open(movie.whereToWatch[platform], '_blank');
    } catch (error) {
      console.error('Decide log error:', error);
    }
  };

  const generateShareCard = async () => {
    if (!cardRef.current) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1f2937',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${movie.title}-reflection-card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Generate card error:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">{movie.title}</h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Hero Section */}
          <div className="relative h-96 p-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover rounded-xl" />
          </div>

          {/* Content */}
          <div className="p-8 -mt-32 relative z-9">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl text-white mb-2">{movie.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-white bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span>{movie.runtime} phút</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span>{movie.rating}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className={`p-3 rounded-lg transition-all ${saved
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={generateShareCard}
                  disabled={generating}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                >
                  {generating ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Vibe Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.vibes.map((vibe, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm"
                >
                  {vibe}
                </span>
              ))}
            </div>

            {/* Emotion Spectrum */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-6">
              <h2 className="text-xl mb-4">Emotion Spectrum</h2>
              <EmotionSpectrum spectrum={movie.spectrum} />
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-xl mb-3">Tóm tắt</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>

            {/* Why This Matches */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6">
              <h3 className="mb-2">✨ Tại sao phù hợp với bạn</h3>
              <p className="text-gray-700 dark:text-gray-300">{movie.whyMatchesMood}</p>
            </div>

            {/* AI Vignette */}
            <div className="mb-6">
              <h2 className="text-xl mb-3">Scene Vignette</h2>
              <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                "{movie.vignette}"
              </p>
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 mb-6 border-l-4 border-purple-500">
              <p className="text-lg italic">"{movie.quote}"</p>
            </div>

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm">Weather Match</h3>
                </div>
                <p className="text-2xl">{movie.weatherMatch}%</p>
              </div>

              {movie.comfortBadge && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm">Comfort Safe</h3>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {movie.comfortBadge}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-5 h-5 text-purple-500" />
                  <h3 className="text-sm">OST Pairing</h3>
                </div>
                <a
                  href={movie.ostLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-500 hover:text-purple-600"
                >
                  Nghe trên Spotify →
                </a>
              </div>
            </div>

            {/* Trailer */}
            <div className="mb-6">
              <h2 className="text-xl mb-3">Trailer</h2>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${movie.trailerYoutubeId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Where to Watch */}
            {movie.whereToWatch && Object.keys(movie.whereToWatch).length > 0 ? (
              <div className="mb-6">
                <h2 className="text-xl mb-3">Xem tại đây</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(movie.whereToWatch).map(([platform, link]) => (
                    <button
                      key={platform}
                      onClick={() => handleDecide(platform)}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                <p className="text-gray-600 dark:text-gray-400">Thông tin xem phim sẽ được cập nhật sớm</p>
              </div>
            )}

            {/* Hidden Share Card */}
            <div className="fixed -left-[9999px]">
              <div
                ref={cardRef}
                className="w-[600px] bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white"
              >
                <h2 className="text-3xl mb-4">{movie.title}</h2>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-4">
                  <EmotionSpectrum spectrum={movie.spectrum} />
                </div>
                <p className="text-lg italic mb-4">"{movie.quote}"</p>
                <p className="text-sm opacity-80">CineMotion • Reflection Card</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => {
              const firstPlatform = Object.keys(movie.whereToWatch || {})[0];
              if (firstPlatform) {
                handleDecide(firstPlatform);
              } else {
                alert('Thông tin xem phim chưa được cập nhật');
              }
            }}
            className="w-full py-4 px-9 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all text-lg disabled:opacity-50"
            disabled={!movie.whereToWatch || Object.keys(movie.whereToWatch).length === 0}
          >
            Chốt xem ngay
          </button>
        </div>
      </div>
    </div>

  );
}
