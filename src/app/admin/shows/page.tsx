'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { Plus, Calendar, Clock, Film, Building2, ArrowLeft } from 'lucide-react';

interface ShowItem {
  id: string;
  startTime: string;
  status: string;
  regularPrice: number;
  premiumPrice: number;
  reclinerPrice: number;
  movie: {
    id: string;
    title: string;
  };
  screen: {
    id: string;
    name: string;
    theatre: {
      id: string;
      name: string;
      city: string;
    };
  };
}

interface MovieOption {
  id: string;
  title: string;
}

interface TheatreOption {
  id: string;
  name: string;
  screens: {
    id: string;
    name: string;
  }[];
}

export default function AdminShowsPage() {
  const [shows, setShows] = useState<ShowItem[]>([]);
  const [movies, setMovies] = useState<MovieOption[]>([]);
  const [theatres, setTheatres] = useState<TheatreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [regularPrice, setRegularPrice] = useState(250);
  const [premiumPrice, setPremiumPrice] = useState(400);
  const [reclinerPrice, setReclinerPrice] = useState(650);

  async function loadData() {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        fetch('/api/shows'),
        fetch('/api/movies'),
        fetch('/api/theatres'),
      ]);

      if (showsRes.ok) {
        const d = await showsRes.json();
        setShows(d.shows || []);
      }
      if (moviesRes.ok) {
        const d = await moviesRes.json();
        setMovies(d.movies || []);
        if (d.movies?.length > 0) setSelectedMovieId(d.movies[0].id);
      }
      if (theatresRes.ok) {
        const d = await theatresRes.json();
        setTheatres(d.theatres || []);
        if (d.theatres?.length > 0) {
          setSelectedTheatreId(d.theatres[0].id);
          if (d.theatres[0].screens?.length > 0) {
            setSelectedScreenId(d.theatres[0].screens[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load shows data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Set default tomorrow date
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setStartDate(tom.toISOString().split('T')[0]);
    loadData();
  }, []);

  const handleTheatreChange = (tId: string) => {
    setSelectedTheatreId(tId);
    const th = theatres.find(t => t.id === tId);
    if (th && th.screens.length > 0) {
      setSelectedScreenId(th.screens[0].id);
    } else {
      setSelectedScreenId('');
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId || !selectedScreenId || !startDate || !startTime) {
      showToast('Please fill all show schedule fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);

      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: selectedMovieId,
          screenId: selectedScreenId,
          startTime: startDateTime.toISOString(),
          regularPrice: Number(regularPrice),
          premiumPrice: Number(premiumPrice),
          reclinerPrice: Number(reclinerPrice),
          status: 'ACTIVE',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Show scheduled successfully!', 'success');
        setShowAddModal(false);
        loadData();
      } else {
        showToast(data.error || 'Failed to schedule show', 'error');
      }
    } catch (err) {
      console.error('Schedule show error', err);
      showToast('Error scheduling show', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  const currentTheatreScreens = theatres.find(t => t.id === selectedTheatreId)?.screens || [];

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white">Show Scheduling</h1>
            <p className="text-gray-400 text-sm mt-1">Schedule cinema shows, assign screen auditoriums, and configure pricing</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Schedule Show
          </button>
        </div>

        {/* Shows Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-800/80 uppercase font-semibold text-gray-400 border-b border-gray-700/80">
                <tr>
                  <th className="py-3.5 px-4">Movie</th>
                  <th className="py-3.5 px-4">Theatre & Screen</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Pricing (Reg/Prem/Recl)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {shows.map(show => {
                  const showDate = new Date(show.startTime).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={show.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {show.movie?.title || 'Unknown'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-purple-300 block">{show.screen?.theatre?.name}</span>
                        <span className="text-[11px] text-gray-400">{show.screen?.name}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {showDate}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        ₹{show.regularPrice} / ₹{show.premiumPrice} / ₹{show.reclinerPrice}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {show.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/shows/${show.id}/seats`}
                          className="text-purple-400 hover:text-purple-300 font-semibold text-xs"
                        >
                          View Seat Map
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Show Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Schedule Cinema Show</h2>
              <form onSubmit={handleCreateShow} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Select Movie</label>
                  <select
                    value={selectedMovieId} onChange={e => setSelectedMovieId(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    {movies.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Multiplex</label>
                    <select
                      value={selectedTheatreId} onChange={e => handleTheatreChange(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      {theatres.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Auditorium / Screen</label>
                    <select
                      value={selectedScreenId} onChange={e => setSelectedScreenId(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      {currentTheatreScreens.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Date</label>
                    <input
                      type="date" required
                      value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Showtime</label>
                    <input
                      type="time" required
                      value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Pricing Tiers */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Regular (₹)</label>
                    <input
                      type="number" required min={50}
                      value={regularPrice} onChange={e => setRegularPrice(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Premium (₹)</label>
                    <input
                      type="number" required min={50}
                      value={premiumPrice} onChange={e => setPremiumPrice(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Recliner (₹)</label>
                    <input
                      type="number" required min={50}
                      value={reclinerPrice} onChange={e => setReclinerPrice(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-800">
                  <button
                    type="button" onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
