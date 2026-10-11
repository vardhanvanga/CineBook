'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Film, ShieldCheck } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/LoadingSpinner';

interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  phone?: string | null;
  amenities: string | string[];
  screens: {
    id: string;
    name: string;
    _count: { seats: number };
  }[];
}

export default function TheatresPage() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheatres() {
      try {
        const res = await fetch('/api/theatres?city=Hyderabad');
        if (res.ok) {
          const data = await res.json();
          setTheatres(data.theatres || []);
        }
      } catch (err) {
        console.error('Failed to load theatres', err);
      } finally {
        setLoading(false);
      }
    }
    loadTheatres();
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Theatres in Hyderabad</h1>
          <p className="text-gray-400 text-sm mt-1">Explore authentic premier cinema locations, premium formats, and facilities</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-gray-400">
          <span className="text-purple-400 font-semibold">Demo Notice:</span> Theatres & screens represent authentic venues with demonstration booking schedules.
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : theatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theatres.map(theatre => {
            const amenitiesList = Array.isArray(theatre.amenities)
              ? theatre.amenities
              : typeof theatre.amenities === 'string'
              ? theatre.amenities.split(',').map(s => s.trim())
              : [];

            return (
              <div key={theatre.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-7 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{theatre.name}</h2>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                        {theatre.address}
                      </p>
                    </div>
                    <span className="bg-purple-900/60 border border-purple-700/60 text-purple-200 text-xs px-3 py-1 rounded-full shrink-0 font-medium">
                      {theatre.area}
                    </span>
                  </div>

                  {theatre.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {theatre.phone}
                    </p>
                  )}

                  {/* Amenities */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((a, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-xl border border-gray-700/60 font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Screens */}
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Screens</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {theatre.screens.map(scr => (
                        <div key={scr.id} className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-3 text-xs space-y-0.5">
                          <span className="font-semibold text-white block truncate">{scr.name}</span>
                          <span className="text-gray-400 text-[11px]">{scr._count?.seats || 0} Seats</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/movies`}
                  className="w-full text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all text-sm shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  View Current Movies & Shows
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center text-gray-400">
          <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-semibold text-white">No Theatres Found</p>
        </div>
      )}
    </div>
  );
}
