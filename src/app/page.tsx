'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MovieCard } from '@/components/movies/MovieCard';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';
import { ChevronRight, Star, Clock, MapPin, Film, Zap, Ticket } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string | string[];
  language: string | string[];
  durationMinutes: number;
  certification: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  rating?: number | null;
  status: string;
  releaseDate: string;
}

interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  amenities: string | string[];
  screens: { id: string }[];
}

function parseList(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [moviesRes, theatresRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/theatres?city=Hyderabad'),
        ]);

        if (moviesRes.ok) {
          const data = await moviesRes.json();
          const all: Movie[] = data.movies || [];
          setNowShowing(all.filter(m => m.status === 'NOW_SHOWING'));
          setComingSoon(all.filter(m => m.status === 'COMING_SOON'));
        }

        if (theatresRes.ok) {
          const tData = await theatresRes.json();
          setTheatres(tData.theatres || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroMovie = nowShowing[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-14 sm:py-18 md:py-22 lg:py-26 overflow-hidden bg-gray-950 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent z-10" />
        
        {heroMovie?.posterUrl ? (
          <Image
            src={heroMovie.posterUrl}
            alt={heroMovie.title}
            fill
            className="object-cover object-top opacity-25"
            unoptimized
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-gray-950 to-gray-950" />
        )}

        <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl py-4 sm:py-6">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-purple-600/30">
                Now Showing
              </span>
              {heroMovie?.certification && (
                <span className="bg-gray-800/80 border border-gray-700/80 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {heroMovie.certification}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight break-words">
              {heroMovie ? heroMovie.title : 'CineBook Hyderabad'}
            </h1>

            {heroMovie && (
              <>
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs sm:text-sm text-gray-300 mb-4 sm:mb-5 font-medium">
                  <span className="text-purple-300 font-semibold">{parseList(heroMovie.genre).slice(0, 3).join(' • ')}</span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4 text-purple-400" />
                    {Math.floor(heroMovie.durationMinutes / 60)}h {heroMovie.durationMinutes % 60}m
                  </span>
                  {heroMovie.rating && (
                    <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      {heroMovie.rating.toFixed(1)}/10
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 line-clamp-3 leading-relaxed max-w-xl">
                  {heroMovie.description}
                </p>
              </>
            )}

            {/* Button options with generous spacing */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              {heroMovie && (
                <Link
                  href={`/movies/${heroMovie.id}`}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <Ticket className="w-4 h-4" /> Book Tickets
                </Link>
              )}
              <Link
                href="/movies"
                className="bg-gray-900/80 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all text-sm sm:text-base cursor-pointer"
              >
                Explore All Movies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 sm:space-y-20 w-full">
        {/* Academic Project & Metadata Notice Banner */}
        <div className="bg-gradient-to-r from-purple-950/40 via-gray-900 to-gray-900 border border-purple-900/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Authentic Movie Catalogue & Hyderabad Multiplexes</h3>
              <p className="text-xs text-gray-400 mt-0.5">Verified official posters, Telugu & Pan-Indian releases with simulated demonstration booking inventory.</p>
            </div>
          </div>
          <Link
            href="/movies"
            className="text-xs font-semibold bg-gray-800 hover:bg-gray-750 text-purple-300 border border-gray-700 px-4 py-2 rounded-xl transition-all whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            Explore Catalogue
          </Link>
        </div>

        {/* Now Showing Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Now Showing</h2>
              <p className="text-gray-400 text-sm">Book tickets for movies currently playing in Hyderabad multiplexes</p>
            </div>
            <Link
              href="/movies?status=NOW_SHOWING"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors self-start sm:self-auto"
            >
              View All Movies <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : nowShowing.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {nowShowing.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-16 text-center text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-lg font-medium text-white">No movies currently showing</p>
              <p className="text-sm text-gray-500 mt-1">Please check back soon for updated show listings</p>
            </div>
          )}
        </section>

        {/* Coming Soon Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Coming Soon</h2>
              <p className="text-gray-400 text-sm">Upcoming blockbusters releasing in theatres soon</p>
            </div>
            <Link
              href="/movies?status=COMING_SOON"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors self-start sm:self-auto"
            >
              View Upcoming <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : comingSoon.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {comingSoon.map(movie => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl overflow-hidden transition-all movie-card flex flex-col justify-between shadow-lg h-full"
                >
                  <div>
                    <div className="relative aspect-[2/3] w-full bg-gray-800 overflow-hidden">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Film className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <span className="inline-block bg-purple-900/90 border border-purple-500/50 text-purple-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                          Releasing {new Date(movie.releaseDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="text-white text-sm sm:text-base font-bold line-clamp-2 min-h-[2.5rem] group-hover:text-purple-400 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {parseList(movie.genre).slice(0, 2).join(' • ')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center text-gray-400">
              <p>No upcoming movies announced yet</p>
            </div>
          )}
        </section>

        {/* Popular Theatres */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Popular Multiplexes</h2>
              <p className="text-gray-400 text-sm">Top-rated cinema destinations and luxury halls in Hyderabad</p>
            </div>
            <Link
              href="/theatres"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors self-start sm:self-auto"
            >
              All Theatres <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {theatres.map(theatre => (
              <Link
                key={theatre.id}
                href="/theatres"
                className="bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl p-5 sm:p-6 transition-all movie-card group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-11 h-11 bg-purple-900/30 border border-purple-800/40 rounded-xl flex items-center justify-center mb-3.5 group-hover:bg-purple-900/50 transition-colors">
                    <Film className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">
                    {theatre.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-gray-400 text-xs mb-2.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{theatre.area}, {theatre.city}</span>
                  </p>
                  <p className="text-xs text-purple-300/80 font-medium mb-3">
                    {theatre.screens.length} Screen{theatre.screens.length !== 1 ? 's' : ''} Configured
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {parseList(theatre.amenities).slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700/50"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-purple-400 font-semibold group-hover:text-purple-300">
                  <span>View Shows</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
