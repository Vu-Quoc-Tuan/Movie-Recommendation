import { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { MovieFilters } from './MovieFilters';
import { MoodCarousel } from './MoodCarousel';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getMovies, Movie } from '../../utils/movieData';

export function MovieCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    vibes: [] as string[],
    genres: [] as string[],
    yearMin: 1990,
    yearMax: 2025,
    duration: [] as string[],
    regions: [] as string[],
    ratingMin: 6.5,
    comfortFlags: [] as string[],
    sort: 'emotion_fit',
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [filters, searchQuery]);

  const loadMovies = async () => {
    setLoading(true);
    const newMovies = await getMovies(filters, searchQuery, 1);
    setMovies(newMovies);
    setPage(1);
    setHasMore(newMovies.length === 24);
    setLoading(false);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    const newMovies = await getMovies(filters, searchQuery, nextPage);
    if (newMovies.length > 0) {
      // Filter out any movies that already exist (by ID) to prevent duplicates
      const existingIds = new Set(movies.map(m => m.id));
      const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));

      if (uniqueNewMovies.length > 0) {
        setMovies([...movies, ...uniqueNewMovies]);
        setPage(nextPage);
        setHasMore(newMovies.length === 24);
      } else {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page, movies]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phim, diễn viên, đạo diễn..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${showFilters
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Mood Picks */}
      <div>
        <h2 className="text-2xl mb-4">
          🎬 Mood Picks Hôm Nay
        </h2>
        <MoodCarousel />
      </div>

      {/* Filters */}
      {showFilters && (
        <MovieFilters filters={filters} onChange={setFilters} />
      )}

      {/* Movie Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">
            {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Tất cả phim'}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {movies.length} phim
          </span>
        </div>

        {loading && movies.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse h-96"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {loading && movies.length > 0 && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && movies.length > 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đã hiển thị tất cả phim
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
