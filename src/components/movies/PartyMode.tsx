import { useState } from 'react';
import { Users, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../shared/ImageWithFallback';
import {analyzePartyMood} from "../../features/emotion/api/emotionApi";

interface PartyMember {
  id: string;
  name: string;
  mood: string;
  moodText?: string;
}

const moodOptions = [
  { value: 'chill', label: '😌 Chill', emoji: '😌' },
  { value: 'excited', label: '🎉 Hào hứng', emoji: '🎉' },
  { value: 'romantic', label: '💕 Lãng mạn', emoji: '💕' },
  { value: 'nostalgic', label: '🌅 Hoài niệm', emoji: '🌅' },
  { value: 'adventure', label: '🗺️ Phiêu lưu', emoji: '🗺️' },
  { value: 'comfort', label: '🤗 An ủi', emoji: '🤗' },
];

export function PartyMode() {
  const [mode, setMode] = useState<'buttons' | 'text'>('buttons');
  const [members, setMembers] = useState<PartyMember[]>([
    { id: '1', name: '', mood: '', moodText: '' },
    { id: '2', name: '', mood: '', moodText: '' },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { id: Date.now().toString(), name: '', mood: '', moodText: '' }]);
    }
  };

  const removeMember = (id: string) => {
    if (members.length > 2) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: 'name' | 'mood' | 'moodText', value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleFind = async () => {
    if (mode === 'buttons') {
      const allFilled = members.every(m => m.name && m.mood);
      if (allFilled) {
        setShowResults(true);
      }
    } else {
      const allFilled = members.every(m => m.name && m.moodText?.trim());
      if (!allFilled) return;

      setLoading(true);
      try {
        const data = await analyzePartyMood(
            members.map(m => ({ name: m.name, moodText: m.moodText }))
        );
        setAiRecommendations(data.recommendations);
        setShowResults(true);
      } catch (error) {
        console.error('Error analyzing party mood:', error);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    }
  };

  const reset = () => {
    setMembers([
      { id: '1', name: '', mood: '', moodText: '' },
      { id: '2', name: '', mood: '', moodText: '' },
    ]);
    setShowResults(false);
    setAiRecommendations([]);
  };

  const recommendations = [
    {
      id: 1,
      title: 'The Grand Budapest Hotel',
      year: '2014',
      poster: 'https://images.unsplash.com/photo-1628336707631-68131ca720c3?w=400',
      vibes: ['Quirky', 'Colorful', 'Nostalgic'],
      rating: 8.1,
      matchScore: 92,
      reason: 'Phù hợp với mood vui vẻ và hoài niệm của nhóm. Câu chuyện độc đáo với phong cách hình ảnh đẹp mắt.',
    },
    {
      id: 2,
      title: 'Parasite',
      year: '2019',
      poster: 'https://images.unsplash.com/photo-1655367574486-f63675dd69eb?w=400',
      vibes: ['Thrilling', 'Dark Comedy', 'Social'],
      rating: 8.5,
      matchScore: 88,
      reason: 'Kết hợp hài hước đen và kịch tính, phù hợp cho những ai muốn trải nghiệm cảm xúc phong phú.',
    },
  ];

  if (showResults) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl mb-2">🎬 Gợi ý cho nhóm của bạn</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Collective Vibe:</span>
                {members.map((member, i) => (
                  <span key={i} className="text-lg">
                    {moodOptions.find(m => m.value === member.mood)?.emoji}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Làm lại
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {members.map((member, i) => (
              <div
                key={i}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm"
              >
                {member.name}: {moodOptions.find(m => m.value === member.mood)?.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(aiRecommendations.length > 0 ? aiRecommendations : recommendations).map((movie) => (
            <div
              key={movie.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
            >
              <div className="flex">
                <div className="w-40 h-56 flex-shrink-0">
                  <ImageWithFallback
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl mb-1">{movie.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{movie.year}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl mb-1">{movie.matchScore}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.vibes.map((vibe, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full"
                      >
                        {vibe}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm">{movie.rating}</span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 inline mr-1 text-purple-500" />
                    {movie.reason}
                  </p>

                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                    Thêm vào danh sách
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-full mb-4">
            <Users className="w-12 h-12 text-purple-500" />
          </div>
          <h1 className="text-3xl mb-3">Party Mode</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Hòa trộn mood của nhóm để tìm phim phù hợp cho tất cả mọi người
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

          {members.map((member, index) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Thành viên {index + 1}</h3>
                {members.length > 2 && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Tên</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                    placeholder="Nhập tên..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                {mode === 'buttons' ? (
                  <div>
                    <label className="block text-sm mb-2">Mood hiện tại</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {moodOptions.map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => updateMember(member.id, 'mood', mood.value)}
                          className={`p-3 rounded-lg transition-all text-left ${member.mood === mood.value
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                        >
                          {mood.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm mb-2">Mô tả mood của {member.name || 'bạn'}</label>
                    <textarea
                      value={member.moodText || ''}
                      onChange={(e) => updateMember(member.id, 'moodText', e.target.value)}
                      placeholder="Ví dụ: Tôi muốn xem gì đó vui vẻ và thư giãn sau một tuần làm việc căng thẳng..."
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none min-h-[80px] resize-y"
                      maxLength={300}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                      {(member.moodText || '').length}/300
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {members.length < 4 && (
            <button
              onClick={addMember}
              className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm thành viên (tối đa 4 người)</span>
            </button>
          )}

          <button
            onClick={handleFind}
            disabled={
              mode === 'buttons'
                ? !members.every(m => m.name && m.mood)
                : !members.every(m => m.name && m.moodText?.trim()) || loading
            }
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang phân tích...</span>
              </>
            ) : (
              <>
                {mode === 'text' && <Sparkles className="w-5 h-5" />}
                <span>Tìm phim cho nhóm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
