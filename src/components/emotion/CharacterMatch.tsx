import { useState } from 'react';
import { Sparkles, User, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import { EmotionSpectrum } from './EmotionSpectrum';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { getApiEndpoint } from '../../config/api';

interface CharacterMatchResult {
  movie: {
    title: string;
    year: string;
    poster: string;
    rating: number;
    character: string;
    characterDescription: string;
    similarity: number;
    whyMatch: string;
    vignette: string;
    quote: string;
    spectrum: {
      calm: number;
      warm: number;
      hopeful: number;
      nostalgic: number;
      bittersweet: number;
      intense: number;
    };
  };
}

export function CharacterMatch() {
  const [moodText, setMoodText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CharacterMatchResult | null>(null);

  const examples = [
    'Hôm nay tôi vừa nhặt được tiền và trả lại người bị mất, tôi cảm thấy rất vui, tự hào về bản thân.',
    'Tôi đang cảm thấy bối rối vì phải đưa ra quyết định quan trọng nhưng không biết nên chọn con đường nào.',
    'Cuộc sống của tôi đang quá nhàm chán, tôi muốn thoát ra khỏi vòng lặp hàng ngày và khám phá điều gì đó mới mẻ.',
  ];

  const handleAnalyze = async () => {
    if (!moodText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        getApiEndpoint('/analyze-character-match'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ moodText }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze mood');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing character match:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMoodText('');
    setResult(null);
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl">✨ Nhân vật phù hợp với bạn</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Tìm lại
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 relative h-96 md:h-auto">
              <ImageWithFallback
                src={result.movie.poster}
                alt={result.movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <div className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <div className="text-2xl text-center">{result.movie.similarity}%</div>
                  <div className="text-xs text-center">Match</div>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 p-8">
              <h3 className="text-3xl mb-2">{result.movie.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-1">{result.movie.year}</p>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-yellow-400">★</span>
                <span>{result.movie.rating}</span>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="mb-2">Nhân vật: {result.movie.character}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {result.movie.characterDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                <h4 className="text-sm mb-3">Emotion Spectrum</h4>
                <EmotionSpectrum spectrum={result.movie.spectrum} mini />
              </div>

              <div className="mb-6">
                <div className="flex items-start space-x-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="mb-2">Tại sao phù hợp với bạn?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {result.movie.whyMatch}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-sm italic text-gray-600 dark:text-gray-300 mb-3">
                  "{result.movie.vignette}"
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border-l-2 border-purple-500">
                <p className="italic">"{result.movie.quote}"</p>
              </div>

              <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                Xem chi tiết phim
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-full mb-4">
            <User className="w-12 h-12 text-purple-500" />
          </div>
          <h1 className="text-3xl mb-3">Character Match</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Mô tả tâm trạng hoặc hoàn cảnh của bạn, AI sẽ tìm nhân vật điện ảnh giống bạn nhất
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-3">
              Bạn đang cảm thấy thế nào? Hoàn cảnh của bạn ra sao?
            </label>
            <textarea
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              placeholder="Hãy chia sẻ về cảm xúc, suy nghĩ, hoặc tình huống hiện tại của bạn..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[150px] resize-y"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {moodText.length}/500 ký tự
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-300">
              💡 Gợi ý câu mẫu:
            </p>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setMoodText(example)}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!moodText.trim() || loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Tìm nhân vật phù hợp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
