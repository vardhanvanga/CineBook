'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MovieCard } from '@/components/movies/MovieCard';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';
import { Search, Film, RotateCcw } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  genre: string | string[];
  language: string | string[];
  durationMinutes: number;
  certification: string;
  posterUrl?: string | null;
  rating?: number | null;
  status: string;
  releaseDate: string;
}

const GENRES = [
  'Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 
  'Crime', 'Mythology', 'Adventure', 'Mystery'
];
const LANGUAGES = ['Telugu', 'Hindi', 'Tamil', 'English'];

function MoviesContent() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (genre) params.set('genre', genre);
        if (language) params.set('language', language);

        const res = await fetch(`/api/movies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMovies(data.movies || []);
        }
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMovies, 250);
    return () => clearTimeout(debounce);
  }, [search, status, genre, language]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Movies in Hyderabad</h1>
        <p className="text-gray-400 text-sm">Browse, filter, and book tickets for all current and upcoming shows</p>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 mb-10 sm:mb-12 shadow-xl space-y-4">
        {/* Quick Category Chips */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-800/80">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Quick Filter:</span>
          <button
            onClick={() => { setStatus(''); setLanguage(''); setGenre(''); }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              !status && !language && !genre
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            All Movies
          </button>
          <button
            onClick={() => { setStatus('NOW_SHOWING'); }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              status === 'NOW_SHOWING'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => { setStatus('COMING_SOON'); }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              status === 'COMING_SOON'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            Coming Soon
          </button>
          <button
            onClick={() => { setLanguage('Telugu'); }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              language === 'Telugu'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            Telugu Releases
          </button>
          <button
            onClick={() => { setGenre('Action'); }}
            className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
              genre === 'Action'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white hover:border-gray-600'
            }`}
          >
            Action Blockbusters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Search Field */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title (e.g. Ranabaali)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
          >
            <option value="">All Release Status</option>
            <option value="NOW_SHOWING">Now Showing</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>

          {/* Genre Filter */}
          <select
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="w-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
          >
            <option value="">All Film Genres</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="w-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl px-4 py-2.5 sm:py-3 text-sm text-gray-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movie Grid with responsive 5-column layout */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-16 sm:p-20 text-center shadow-xl">
          <Film className="w-16 h-16 mx-auto text-gray-600 mb-5" />
          <h3 className="text-2xl font-bold text-white mb-3">No Movies Found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            We couldn't find any movies matching your current filter criteria. Try clearing filters or searching for another title.
          </p>
          <button
            onClick={() => { setSearch(''); setStatus(''); setGenre(''); setLanguage(''); }}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-600/30 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    }>
      <MoviesContent />
    </Suspense>
  );
}
