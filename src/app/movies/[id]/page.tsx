'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Clock, Star, Film, Calendar, MapPin, ChevronRight, ShieldCheck, Ticket } from 'lucide-react';

interface Show {
  id: string;
  startTime: string;
  regularPrice: number;
  premiumPrice: number;
  reclinerPrice: number;
  screen: {
    id: string;
    name: string;
    theatre: {
      id: string;
      name: string;
      area: string;
      city: string;
      amenities: string | string[];
    };
  };
}

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
  releaseDate: string;
  status: string;
  cast?: string | any[];
  shows: Show[];
}

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMovie(data.movie);
        }
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Film className="w-16 h-16 mx-auto text-gray-600 mb-5" />
        <h2 className="text-2xl font-bold text-white mb-3">Movie Not Found</h2>
        <p className="text-gray-400 mb-8 text-sm">The requested movie does not exist or has been removed from the schedule.</p>
        <Link href="/movies" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm shadow-lg shadow-purple-600/30">
          Browse Movies
        </Link>
      </div>
    );
  }

  const genres = Array.isArray(movie.genre) ? movie.genre : typeof movie.genre === 'string' ? movie.genre.split(',').map(s => s.trim()) : [];
  const languages = Array.isArray(movie.language) ? movie.language : typeof movie.language === 'string' ? movie.language.split(',').map(s => s.trim()) : [];
  let parsedCast: any[] = [];
  try {
    parsedCast = typeof movie.cast === 'string' ? JSON.parse(movie.cast) : Array.isArray(movie.cast) ? movie.cast : [];
  } catch {
    parsedCast = [];
  }

  // Generate upcoming 3 dates for the date picker
  const dates = [0, 1, 2].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    };
  });

  const currentDateIso = selectedDate || dates[0].iso;

  // Filter shows by selected date
  const filteredShows = (movie.shows || []).filter(show => {
    const showDateIso = new Date(show.startTime).toISOString().split('T')[0];
    return showDateIso === currentDateIso;
  });

  // Group shows by theatre
  const theatreGroups: { [theatreId: string]: { theatre: any; shows: Show[] } } = {};
  filteredShows.forEach(show => {
    const t = show.screen.theatre;
    if (!theatreGroups[t.id]) {
      theatreGroups[t.id] = { theatre: t, shows: [] };
    }
    theatreGroups[t.id].shows.push(show);
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Movie Hero Banner */}
      <div className="relative bg-gray-950 border-b border-gray-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-25">
          {movie.bannerUrl || movie.posterUrl ? (
            <Image src={movie.bannerUrl || movie.posterUrl || ''} alt={movie.title} fill className="object-cover blur-xl" unoptimized />
          ) : null}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            {/* Poster Card */}
            <div className="relative w-56 sm:w-64 h-80 sm:h-96 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-gray-800">
              {movie.posterUrl ? (
                <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" unoptimized priority />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Film className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-purple-600/30">
                  {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span className="bg-gray-800/80 border border-gray-700/80 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-md">
                  {movie.certification}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                {movie.title}
              </h1>

              {movie.rating && (
                <div className="flex items-center gap-2.5 text-yellow-400 font-bold text-lg">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{movie.rating.toFixed(1)}/10</span>
                  <span className="text-gray-400 text-sm font-normal">Audience Score</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
                <span>•</span>
                <span>{genres.join(', ')}</span>
                <span>•</span>
                <span>{languages.join(', ')}</span>
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl pt-1">
                {movie.description}
              </p>

              {parsedCast.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Principal Cast</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {parsedCast.map((c, i) => (
                      <span key={i} className="text-xs bg-gray-900 border border-gray-800 text-gray-200 px-3.5 py-1.5 rounded-full font-medium">
                        {c.name} {c.role ? `(${c.role})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Show Selection Section */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        {movie.status === 'COMING_SOON' ? (
          <div className="bg-gradient-to-br from-gray-900 to-purple-950/40 border border-purple-900/40 rounded-3xl p-8 sm:p-14 text-center shadow-2xl max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-purple-900/50 border border-purple-600/50 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-900/50">
              <Calendar className="w-8 h-8 text-purple-300" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-block bg-purple-600/30 border border-purple-500/50 text-purple-200 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                Theatrical Premiere Announcement
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Releasing On {new Date(movie.releaseDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                Official bookings and premiere showtimes across Hyderabad multiplexes (AMB Cinemas, PVR ICON, Prasads Multiplex, INOX GVK One) will open closer to the theatrical release.
              </p>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 text-xs text-gray-400 max-w-lg mx-auto">
              <span className="font-semibold text-purple-400">Notice:</span> Verified authentic metadata and official promotional assets are featured above. Advance booking reservations are disabled until theatrical distribution schedules are released.
            </div>

            <div className="pt-2">
              <Link
                href="/movies?status=NOW_SHOWING"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <Ticket className="w-4 h-4" /> Browse Now Showing Movies
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Select Date & Showtimes</h2>
                <p className="text-gray-400 text-sm">Choose your preferred screening at Hyderabad multiplexes</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-400 self-start md:self-auto">
                <span className="text-purple-400 font-semibold">Demo Notice:</span> Screenings represent simulated inventory for project demonstration
              </div>
            </div>

            {/* Date Selector Tabs with generous spacing */}
            <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-4 mb-10 no-scrollbar">
              {dates.map(d => {
                const isSelected = currentDateIso === d.iso;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    className={`flex flex-col items-center justify-center min-w-[110px] sm:min-w-[125px] px-6 py-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-600/30 scale-[1.02]'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider font-semibold">{d.dayName}</span>
                    <span className="text-base sm:text-lg font-extrabold mt-1">{d.dateFormatted}</span>
                  </button>
                );
              })}
            </div>

            {/* Theatres & Shows List */}
            {Object.keys(theatreGroups).length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {Object.values(theatreGroups).map(({ theatre, shows }) => (
                  <div key={theatre.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-gray-800">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white">{theatre.name}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {theatre.address || `${theatre.area}, ${theatre.city}`}
                        </p>
                        {theatre.amenities && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {(Array.isArray(theatre.amenities) ? theatre.amenities : typeof theatre.amenities === 'string' ? theatre.amenities.split(',') : []).slice(0, 3).map((a: string, i: number) => (
                              <span key={i} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-750">
                                {a.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3.5 py-1.5 rounded-full self-start sm:self-auto shrink-0">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Instant M-Ticket Pass</span>
                      </div>
                    </div>

                    {/* Showtimes Grid with spacious pills */}
                    <div className="flex flex-wrap gap-3.5 sm:gap-4">
                      {shows.map(show => {
                        const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        });
                        return (
                          <Link
                            key={show.id}
                            href={`/shows/${show.id}/seats`}
                            className="group flex flex-col items-center bg-gray-800/70 hover:bg-purple-600 border border-gray-700/80 hover:border-purple-500 py-3.5 px-5 rounded-2xl transition-all shadow-md hover:scale-[1.03] active:scale-[0.98] text-center min-w-[130px] cursor-pointer"
                          >
                            <span className="text-base font-extrabold text-white group-hover:text-white">
                              {timeStr}
                            </span>
                            <span className="text-xs text-gray-400 group-hover:text-purple-100 mt-1 font-medium">
                              {show.screen.name}
                            </span>
                            <span className="text-[11px] text-purple-400 group-hover:text-purple-200 mt-1.5 font-semibold">
                              From ₹{show.regularPrice}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-16 text-center shadow-xl">
                <Calendar className="w-14 h-14 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Shows Scheduled For This Date</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  There are no active shows scheduled for {dates.find(d => d.iso === currentDateIso)?.dayName}. Please pick another date or browse other titles.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
