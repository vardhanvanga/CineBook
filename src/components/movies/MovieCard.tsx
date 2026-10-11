import Link from 'next/link';
import Image from 'next/image';
import { Clock, Star, Film, Ticket } from 'lucide-react';

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
}

export function MovieCard({ movie }: { movie: Movie }) {
  const isBookable = movie.status === 'NOW_SHOWING';
  const genres = Array.isArray(movie.genre)
    ? movie.genre
    : typeof movie.genre === 'string'
    ? (movie.genre as string).split(',').map((s: string) => s.trim())
    : [];
  const languages = Array.isArray(movie.language)
    ? movie.language
    : typeof movie.language === 'string'
    ? (movie.language as string).split(',').map((s: string) => s.trim())
    : [];

  return (
    <div className="movie-card bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-600/60 transition-all flex flex-col justify-between shadow-lg h-full">
      <div>
        {/* Consistent 2:3 Poster Aspect Ratio */}
        <div className="relative aspect-[2/3] w-full bg-gray-800 overflow-hidden">
          {movie.posterUrl ? (
            <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Film className="w-12 h-12 text-gray-600" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <span className="bg-black/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md border border-white/10">
              {movie.certification || 'UA'}
            </span>
          </div>
          {movie.rating ? (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/80 backdrop-blur-sm text-yellow-400 text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/10">
              <Star className="w-3 h-3 fill-current" />
              {movie.rating.toFixed(1)}
            </div>
          ) : null}
          {!isBookable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
              <span className="bg-purple-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-purple-600/40">
                Coming Soon
              </span>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-4 sm:p-4.5 space-y-1.5">
          <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2 min-h-[2.5rem]">
            {movie.title}
          </h3>
          <p className="text-purple-300/80 text-xs font-medium truncate">
            {genres.length > 0 ? genres.slice(0, 2).join(' • ') : 'Cinema'}
          </p>
          <div className="flex items-center gap-2.5 text-gray-400 text-xs pt-0.5">
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-purple-400" />
              {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
            </span>
            <span>•</span>
            <span className="truncate">{languages.length > 0 ? languages.slice(0, 2).join(', ') : 'Telugu'}</span>
          </div>
        </div>
      </div>

      {/* Button Action Aligned at Bottom */}
      <div className="p-4 sm:p-4.5 pt-0">
        {isBookable ? (
          <Link
            href={`/movies/${movie.id}`}
            className="w-full text-center bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Ticket className="w-4 h-4" /> Book Now
          </Link>
        ) : (
          <Link
            href={`/movies/${movie.id}`}
            className="w-full text-center bg-gray-800 hover:bg-gray-750 text-gray-300 text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl transition-colors block cursor-pointer"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
