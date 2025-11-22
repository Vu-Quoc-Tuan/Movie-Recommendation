import { useState, useEffect, useCallback } from 'react';
import { fetchMovies, fetchMoodPicks } from '../api/movieApi';
import { Movie } from '../types/movie.types';

interface UseMoviesOptions {
    filters?: any;
    searchQuery?: string;
    autoLoad?: boolean;
}

/**
 * Hook để quản lý danh sách phim với pagination
 */
export function useMovies(options: UseMoviesOptions = {}) {
    const { filters = {}, searchQuery = '', autoLoad = true } = options;

    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMovies = useCallback(async (pageNum: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            console.log(filters)
            const newMovies = await fetchMovies(filters, searchQuery, pageNum);

            if (pageNum === 1) {
                setMovies(newMovies);
            } else {
                // Load more - append to existing
                const existingIds = new Set(movies.map(m => m.id));
                const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
                setMovies(prev => [...prev, ...uniqueNewMovies]);
            }

            setPage(pageNum);
            setHasMore(newMovies.length === 24);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load movies');
            console.error('Error loading movies:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, searchQuery, movies]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadMovies(page + 1);
        }
    }, [loading, hasMore, page, loadMovies]);

    const reset = useCallback(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
        loadMovies(1);
    }, [loadMovies]);

    useEffect(() => {
        if (autoLoad) {
            loadMovies(1);
        }
    }, [filters, searchQuery]); // Reload when filters/search change

    return {
        movies,
        loading,
        error,
        hasMore,
        page,
        loadMore,
        reload: () => loadMovies(1),
        reset,
    };
}

/**
 * Hook để lấy mood picks
 */
export function useMoodPicks() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMoodMovies = async () => {
            setLoading(true);
            setError(null);
            try {
                const moodMovies = await fetchMoodPicks();
                setMovies(moodMovies);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load mood picks');
                console.error('Error loading mood picks:', err);
            } finally {
                setLoading(false);
            }
        };
        loadMoodMovies();
    }, []);

    return { movies, loading, error };
}