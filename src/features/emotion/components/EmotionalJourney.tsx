import { useState } from 'react';
import { ArrowRight, Heart, Sparkles, Loader2 } from 'lucide-react';
import { EmotionSpectrum } from './EmotionSpectrum';
import { ImageWithFallback } from '../../../components/shared/ImageWithFallback';
import { analyzeEmotionalJourney } from "../api/emotionApi";

// Helper function to generate random spectrum values
function generateRandomSpectrum() {
  return {
    calm: Math.floor(Math.random() * 101),
    warm: Math.floor(Math.random() * 101),
    hopeful: Math.floor(Math.random() * 101),
  };
}

const moods = [
  { value: 'anxious', label: '😰 Lo lắng', color: 'bg-red-100 dark:bg-red-900/20' },
  { value: 'sad', label: '😢 Buồn', color: 'bg-blue-100 dark:bg-blue-900/20' },
  { value: 'stressed', label: '😫 Căng thẳng', color: 'bg-orange-100 dark:bg-orange-900/20' },
  { value: 'lonely', label: '😔 Cô đơn', color: 'bg-purple-100 dark:bg-purple-900/20' },
  { value: 'tired', label: '😴 Mệt mỏi', color: 'bg-gray-100 dark:bg-gray-900/20' },
  { value: 'happy', label: '😊 Vui vẻ', color: 'bg-green-100 dark:bg-green-900/20' },
  { value: 'calm', label: '😌 Bình yên', color: 'bg-teal-100 dark:bg-teal-900/20' },
  { value: 'hopeful', label: '🌟 Hy vọng', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
];

const targetMoods = [
  { value: 'calm', label: '🧘 Bình yên' },
  { value: 'hopeful', label: '✨ Hy vọng' },
  { value: 'energized', label: '⚡ Năng lượng' },
  { value: 'confident', label: '💪 Tự tin' },
  { value: 'comforted', label: '🤗 An ủi' },
  { value: 'inspired', label: '🎨 Truyền cảm hứng' },
];

const journeyResults = {
  release: {
    title: 'Everything Everywhere All at Once',
    year: '2022',
    poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
    vignette: 'Một người phụ nữ bình thường khám phá vô số vũ trụ song song, mang theo cảm xúc hỗn loạn nhưng đầy màu sắc. Hành trình giải phóng cảm xúc qua những tình huống phi thường.',
    quote: 'Trong vô vàn vũ trụ, tôi chọn yêu bạn.',
    spectrum: generateRandomSpectrum(),
  },
  reflect: {
    title: 'The Farewell',
    year: '2019',
    poster: 'https://images.unsplash.com/photo-1677741446873-bd348677e530?w=400',
    vignette: 'Một gia đình Trung Quốc tổ chức đám cưới giả để tạm biệt bà nội đang mắc bệnh. Khoảnh khắc suy ngẫm về gia đình, sự dối trá tử tế, và tình yêu thương.',
    quote: 'Đôi khi, tình yêu là giữ bí mật.',
    spectrum: generateRandomSpectrum(),
  },
  rebuild: {
    title: 'Little Miss Sunshine',
    year: '2006',
    poster: 'https://images.unsplash.com/photo-1588852112013-6b63362bc583?w=400',
    vignette: 'Một gia đình rối loạn cùng nhau lên đường đưa cô con gái nhỏ đến cuộc thi sắc đẹp. Hài hước, ấm áp, và đầy hy vọng về sức mạnh của sự đoàn kết.',
    quote: 'Chúng ta không thất bại, chỉ là chưa thắng.',
    spectrum: generateRandomSpectrum(),
  },
};

export function EmotionalJourney() {
  const [mode, setMode] = useState<'buttons' | 'text'>('buttons');
  const [moodNow, setMoodNow] = useState('');
  const [moodTarget, setMoodTarget] = useState('');
  const [moodText, setMoodText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  const handleStart = async () => {
    if (moodNow && moodTarget) {
      setLoading(true);
      try {
        const data = await analyzeEmotionalJourney(moodNow + moodTarget);

        // Gán spectrum random vào từng step nếu chưa có
        const aiWithSpectrum = {
          release: { ...data.release, spectrum: generateRandomSpectrum() },
          reflect: { ...data.reflect, spectrum: generateRandomSpectrum() },
          rebuild: { ...data.rebuild, spectrum: generateRandomSpectrum() },
        };

        setAiResults(aiWithSpectrum);
        setShowResults(true);
      } catch (error) {
        console.error('Error analyzing emotional journey:', error);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTextAnalysis = async () => {
    if (!moodText.trim()) return;

    setLoading(true);
    try {
      const data = await analyzeEmotionalJourney(moodText);

      const aiWithSpectrum = {
        release: { ...data.release, spectrum: generateRandomSpectrum() },
        reflect: { ...data.reflect, spectrum: generateRandomSpectrum() },
        rebuild: { ...data.rebuild, spectrum: generateRandomSpectrum() },
      };

      setAiResults(aiWithSpectrum);
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing emotional journey:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMoodNow('');
    setMoodTarget('');
    setMoodText('');
    setShowResults(false);
    setAiResults(null);
  };

  if (showResults) {
    const results = aiResults || journeyResults;
    const moodDisplay = aiResults
      ? `AI phân tích: "${moodText.slice(0, 60)}${moodText.length > 60 ? '...' : ''}"`
      : `${moods.find(m => m.value === moodNow)?.label} → ${targetMoods.find(m => m.value === moodTarget)?.label}`;

    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl">✨ Liệu trình cảm xúc của bạn</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Làm lại
            </button>
          </div>
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300">
            {aiResults ? (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm">{moodDisplay}</span>
              </div>
            ) : (
              <>
                <span>{moods.find(m => m.value === moodNow)?.label}</span>
                <ArrowRight className="w-5 h-5" />
                <span>{targetMoods.find(m => m.value === moodTarget)?.label}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Release */}
          <JourneyCard
            step="Release"
            stepNumber="1"
            description="Giải phóng cảm xúc hiện tại"
            movie={results.release}
            color="from-red-500 to-orange-500"
          />

          {/* Reflect */}
          <JourneyCard
            step="Reflect"
            stepNumber="2"
            description="Suy ngẫm và chấp nhận"
            movie={results.reflect}
            color="from-blue-500 to-purple-500"
          />

          {/* Rebuild */}
          <JourneyCard
            step="Rebuild"
            stepNumber="3"
            description="Xây dựng lại cảm xúc"
            movie={results.rebuild}
            color="from-green-500 to-teal-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-full mb-4">
            <Heart className="w-12 h-12 text-purple-500" />
          </div>
          <h1 className="text-3xl mb-3">Liệu trình Cảm xúc</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Hành trình 3 bước để điều hướng cảm xúc của bạn: Release → Reflect → Rebuild
          </p>
        </div>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center justify-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('buttons')}
              className={`px-6 py-2 rounded-lg transition-all ${mode === 'buttons'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              Chọn mood
            </button>
            <button
              onClick={() => setMode('text')}
              className={`px-6 py-2 rounded-lg transition-all flex items-center space-x-2 ${mode === 'text'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mô tả bằng lời</span>
            </button>
          </div>

          {mode === 'buttons' ? (
            <>
              {/* Current Mood */}
              <div>
                <label className="block mb-3">
                  Bạn đang cảm thấy thế nào?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setMoodNow(mood.value)}
                      className={`p-4 rounded-xl transition-all text-left ${moodNow === mood.value
                        ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                        : 'hover:scale-105'
                        } ${mood.color}`}
                    >
                      <div>{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Mood */}
              <div>
                <label className="block mb-3">
                  Bạn muốn cảm thấy như thế nào?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {targetMoods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setMoodTarget(mood.value)}
                      className={`p-4 bg-white dark:bg-gray-800 rounded-xl transition-all text-left hover:scale-105 ${moodTarget === mood.value
                        ? 'ring-2 ring-purple-500 shadow-lg scale-105'
                        : ''
                        }`}
                    >
                      <div>{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={!moodNow || !moodTarget || loading}
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
                    <span>Phân tích & Tạo liệu trình</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Text Mode */}
              <div>
                <label className="block mb-3">
                  Hãy chia sẻ về cảm xúc của bạn
                </label>
                <textarea
                  value={moodText}
                  onChange={(e) => setMoodText(e.target.value)}
                  placeholder="Ví dụ: Hôm nay tôi vừa nhặt được tiền và trả lại người bị mất, tôi cảm thấy rất vui, tự hào về bản thân mình..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[120px] resize-y"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    AI sẽ phân tích cảm xúc và gợi ý liệu trình phù hợp
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {moodText.length}/500
                  </span>
                </div>
              </div>

              <button
                onClick={handleTextAnalysis}
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
                    <span>Phân tích & Tạo liệu trình</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JourneyCard({ step, stepNumber, description, movie, color }: any) {
  if (!movie) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header với step và description */}
      <div className={`bg-gradient-to-r ${color} p-4 text-white`}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
            {stepNumber}
          </div>
          <h3 className="text-xl font-semibold">{step}</h3>
        </div>
        <p className="text-sm text-white/90">{description}</p>
      </div>

      {/* Poster */}
      <div className="p-4">
        <div className="relative h-48 rounded-lg overflow-hidden mb-4 shadow-sm">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Mood badges */}
          {movie.mood && movie.mood.length > 0 && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {movie.mood.map((m: string) => (
                <span
                  key={m}
                  className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title & Year */}
        <h4 className="text-lg font-semibold mb-1">{movie.title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{movie.year}</p>

        {/* Spectrum */}
        {movie.spectrum && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
            <EmotionSpectrum spectrum={movie.spectrum} />
          </div>
        )}

        {/* Overview */}
        {movie.movie_overview && movie.movie_overview !== "Chưa có mô tả" && (
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 border-l-2 border-purple-500">
            <p className="text-sm italic">{movie.movie_overview}</p>
          </div>
        )}
      </div>
    </div>
  );
}


