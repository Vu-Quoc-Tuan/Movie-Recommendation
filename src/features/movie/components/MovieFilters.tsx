import { Shield, Sparkles } from 'lucide-react';

interface FilterProps {
  filters: any;
  onChange: (filters: any) => void;
}

export function MovieFilters({ filters, onChange }: FilterProps) {
  const vibes = [
    'Cozy', 'Quiet Romance', 'Hopepunk', 'Rainy Night',
    'Wholesome', 'Slow-life', 'Cathartic', 'Dreamy',
    'Melancholic', 'Uplifting', 'Nostalgic', 'Heartwarming'
  ];

  const genres = [
    'Romance', 'Drama', 'Comedy', 'Fantasy',
    'Slice of Life', 'Thriller', 'Animation', 'Sci-Fi'
  ];

  const durations = [
    { label: 'Ngắn (<95 phút)', value: 'short' },
    { label: 'Vừa (95-120 phút)', value: 'medium' },
    { label: 'Dài (>120 phút)', value: 'long' },
  ];

  const regions = [
    { label: '🇰🇷 Hàn Quốc', value: 'Hàn Quốc' },
    { label: '🇯🇵 Nhật Bản', value: 'Nhật Bản' },
    { label: '🇺🇸 Mỹ', value: 'Mỹ' },
    { label: '🇪🇺 Châu Âu', value: 'Châu ÂU' },
    { label: '🇻🇳 Việt Nam', value: 'Việt Nam' },
    { label: '🇨🇳 Trung Quốc', value: 'Trung Quốc' },
  ];

  const comfortOptions = [
    { label: 'No heartbreak', value: 'no_heartbreak' },
    { label: 'No death', value: 'no_death' },
    { label: 'No heavy trauma', value: 'no_trauma' },
    { label: 'Positive ending', value: 'positive_end' },
  ];

  const sortOptions = [
    { label: 'Phù hợp cảm xúc', value: 'emotion_fit' },
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Rating cao', value: 'rating' },
    { label: 'Phổ biến', value: 'popular' },
    { label: 'A–Z', value: 'alpha' },
  ];

  const toggleArrayFilter = (key: string, value: string) => {
    console.log("key", key, "value", value)
    const current = filters[key] || [];
    const newValue = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: newValue });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      {/* Vibe Filters */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg">Vibe</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <button
              key={vibe}
              onClick={() => toggleArrayFilter('vibes', vibe)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filters.vibes.includes(vibe)
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {vibe}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filters */}
      <div>
        <h3 className="text-lg mb-3">Thể loại</h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleArrayFilter('genres', genre)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filters.genres.includes(genre)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-lg mb-3">Năm phát hành</h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={filters.yearMin}
            onChange={(e) => onChange({ ...filters, yearMin: parseInt(e.target.value) })}
            className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            min="1900"
            max="2025"
          />
          <span className="text-gray-500">đến</span>
          <input
            type="number"
            value={filters.yearMax}
            onChange={(e) => onChange({ ...filters, yearMax: parseInt(e.target.value) })}
            className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            min="1900"
            max="2025"
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="text-lg mb-3">Thời lượng</h3>
        <div className="flex flex-wrap gap-2">
          {durations.map((duration) => (
            <button
              key={duration.value}
              onClick={() => toggleArrayFilter('duration', duration.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filters.duration.includes(duration.value)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {duration.label}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <h3 className="text-lg mb-3">Khu vực</h3>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.value}
              onClick={() => toggleArrayFilter('regions', region.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filters.regions.includes(region.value)
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-lg mb-3">Rating tối thiểu</h3>
        <div className="flex gap-2">
          {[6.5, 7.0, 7.5, 8.0].map((rating) => (
            <button
              key={rating}
              onClick={() => onChange({ ...filters, ratingMin: rating })}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filters.ratingMin === rating
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {rating}+
            </button>
          ))}
        </div>
      </div>

      {/* Comfort Guardian */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="text-lg">Comfort Guardian</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">(Chế độ an toàn cảm xúc)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {comfortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleArrayFilter('comfortFlags', option.value)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filters.comfortFlags.includes(option.value)
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-lg mb-3">Sắp xếp</h3>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onChange({
          vibes: [],
          genres: [],
          yearMin: 1990,
          yearMax: 2025,
          duration: [],
          regions: [],
          ratingMin: 6.5,
          comfortFlags: [],
          sort: 'emotion_fit',
        })}
        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
}
