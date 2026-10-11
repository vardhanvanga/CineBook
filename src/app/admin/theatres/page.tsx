'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { Plus, Building2, MapPin, ArrowLeft, Phone } from 'lucide-react';

interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  phone?: string | null;
  amenities: string | string[];
  status: string;
  screens: {
    id: string;
    name: string;
    totalSeats: number;
    _count?: { seats: number };
  }[];
}

export default function AdminTheatresPage() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [amenities, setAmenities] = useState('Dolby Atmos, 4DX, Recliner Seats, Parking');

  async function loadTheatres() {
    try {
      const res = await fetch('/api/theatres');
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

  useEffect(() => {
    loadTheatres();
  }, []);

  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/theatres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          address,
          city,
          area,
          phone,
          amenities,
          status: 'ACTIVE',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Theatre multiplex created successfully!', 'success');
        setShowAddModal(false);
        setName('');
        setAddress('');
        setArea('');
        setPhone('');
        loadTheatres();
      } else {
        showToast(data.error || 'Failed to create theatre', 'error');
      }
    } catch (err) {
      console.error('Error creating theatre', err);
      showToast('Error creating theatre', 'error');
    } finally {
      setSubmitting(false);
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
            <h1 className="text-3xl font-extrabold text-white">Theatre Multiplexes</h1>
            <p className="text-gray-400 text-sm mt-1">Configure cinemas, screen layouts, and city locations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Add Theatre
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theatres.map(theatre => (
            <div key={theatre.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-white">{theatre.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {theatre.address || `${theatre.area}, ${theatre.city}`}
                  </p>
                </div>
                <span className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {theatre.status}
                </span>
              </div>

              {theatre.phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-3">
                  <Phone className="w-3.5 h-3.5" /> {theatre.phone}
                </p>
              )}

              {/* Screens List */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                  Screens ({theatre.screens.length})
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {theatre.screens.map(scr => (
                    <div key={scr.id} className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-2.5 text-xs">
                      <span className="font-bold text-white block truncate">{scr.name}</span>
                      <span className="text-gray-400 text-[11px]">{scr.totalSeats || scr._count?.seats || 0} Total Seats</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Theatre Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Add Cinema Multiplex</h2>
              <form onSubmit={handleAddTheatre} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Theatre Name</label>
                  <input
                    type="text" required placeholder="e.g. Asian CineSquare Multiplex"
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Full Address</label>
                  <input
                    type="text" required placeholder="Mall, Road Name..."
                    value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">City</label>
                    <input
                      type="text" required
                      value={city} onChange={e => setCity(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-400 block mb-1">Area / Locality</label>
                    <input
                      type="text" required placeholder="e.g. Madhapur"
                      value={area} onChange={e => setArea(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Phone Number</label>
                  <input
                    type="tel" placeholder="040-XXXXXXXX"
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-400 block mb-1">Amenities</label>
                  <input
                    type="text"
                    value={amenities} onChange={e => setAmenities(e.target.value)}
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
                    {submitting ? 'Creating...' : 'Create Theatre'}
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
