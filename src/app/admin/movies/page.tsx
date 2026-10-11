'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { Plus, Film, Clock, Star, ArrowLeft, Trash2, Edit2, CheckCircle } from 'lucide-react';

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string | string[];
  language: string | string[];
  durationMinutes: number;
  certification: string;
  posterUrl?: string | null;
  status: string;
  rating?: number | null;
  releaseDate: string;
}

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New movie form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Action, Drama');
  const [language, setLanguage] = useState('Telugu, Hindi');
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [certification, setCertification] = useState('UA');
  const [posterUrl, setPosterUrl] = useState('');
  const [status, setStatus] = useState('NOW_SHOWING');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);

  async function loadMovies() {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovies();
  }, []);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          genre,
          language,
          durationMinutes: Number(durationMinutes),
          certification,
          posterUrl: posterUrl || null,
          status,
          releaseDate: new Date(releaseDate),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Movie added successfully!', 'success');
        setShowAddModal(false);
        // Reset form
        setTitle('');
        setDescription('');
        setPosterUrl('');
        loadMovies();
      } else {
        showToast(data.error || 'Failed to add movie', 'error');
      }
    } catch (err) {
      console.error('Error adding movie', err);
      showToast('Error adding movie', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (movie: Movie) => {
    const newStatus = movie.status === 'NOW_SHOWING' ? 'COMING_SOON' : 'NOW_SHOWING';
    try {
      const res = await fetch(`/api/movies/${movie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Movie status updated to ${newStatus}`, 'success');
        loadMovies();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (err) {
      console.error('Toggle status error', err);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white">Movie Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage cinema films catalog, release dates, and visibility</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Add New Movie
          </button>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map(movie => (
            <div key={movie.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-4 items-start">
              <div className="relative w-20 h-28 bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-700">
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full"><Film className="w-8 h-8 text-gray-600" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    movie.status === 'NOW_SHOWING' ? 'bg-emerald-950 border border-emerald-700 text-emerald-300' : 'bg-purple-950 border border-purple-700 text-purple-300'
                  }`}>
                    {movie.status}
                  </span>
                  <span className="text-xs text-gray-400">{movie.certification}</span>
                </div>
                <h3 className="font-bold text-white text-sm truncate">{movie.title}</h3>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {typeof movie.genre === 'string' ? movie.genre : movie.genre?.join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </p>

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleToggleStatus(movie)}
                    className="text-[11px] bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg transition-colors font-medium"
                  >
                    Set {movie.status === 'NOW_SHOWING' ? 'Coming Soon' : 'Now Showing'}
                  </button>
                  <Link
                    href={`/movies/${movie.id}`}
                    className="text-[11px] text-purple-400 hover:text-purple-300 px-2 py-1 transition-colors font-medium ml-auto"
                  >
                    View Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Movie Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl my-8">
              <h2 className="text-xl font-bold text-white mb-4">Add New Movie</h2>
              <form onSubmit={handleAddMovie} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Movie Title</label>
                  <input
                    type="text" required placeholder="e.g. Salaar 2"
                    value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Synopsis / Description</label>
                  <textarea
                    required rows={3} placeholder="Movie storyline..."
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Genre(s)</label>
                    <input
                      type="text" placeholder="Action, Sci-Fi"
                      value={genre} onChange={e => setGenre(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Language(s)</label>
                    <input
                      type="text" placeholder="Telugu, Hindi"
                      value={language} onChange={e => setLanguage(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Duration (Min)</label>
                    <input
                      type="number" required min={30}
                      value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Certification</label>
                    <select
                      value={certification} onChange={e => setCertification(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="U">U</option>
                      <option value="UA">UA</option>
                      <option value="A">A</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Status</label>
                    <select
                      value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Poster Image URL (Optional)</label>
                  <input
                    type="url" placeholder="https://..."
                    value={posterUrl} onChange={e => setPosterUrl(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Release Date</label>
                  <input
                    type="date" required
                    value={releaseDate} onChange={e => setReleaseDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
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
                    {submitting ? 'Saving...' : 'Add Movie'}
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
