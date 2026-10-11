'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Ticket, Search, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BookingRecord {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: string;
  checkedIn: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  show?: {
    startTime: string;
    movie?: {
      title: string;
    };
    screen?: {
      name: string;
      theatre?: {
        name: string;
      };
    };
  };
  seats?: {
    category: string;
    seat: {
      rowLabel: string;
      seatNumber: number;
    };
  }[];
  payment?: {
    status: string;
    providerReference?: string | null;
  } | null;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error('Failed to load bookings', err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  if (loading) return <PageLoader />;

  const filtered = bookings.filter(b => {
    const matchSearch =
      !search ||
      b.bookingReference.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.show?.movie?.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Booking Orders Management</h1>
          <p className="text-gray-400 text-sm mt-1">Audit customer ticket reservations, verify payments, and inspect admission state</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, customer name, movie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-800/80 uppercase font-semibold text-gray-400 border-b border-gray-700/80">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Movie & Theatre</th>
                  <th className="py-3.5 px-4">Seats Allocated</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Admission</th>
                  <th className="py-3.5 px-4 text-right">View Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{b.user?.name || 'Customer'}</span>
                      <span className="text-[11px] text-gray-400">{b.user?.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white block">{b.show?.movie?.title}</span>
                      <span className="text-[11px] text-gray-400">{b.show?.screen?.theatre?.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.seats && b.seats.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {b.seats.map((s, idx) => (
                            <span key={idx} className="bg-purple-950/80 text-purple-300 border border-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                              {s.seat.rowLabel}{s.seat.seatNumber}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{b.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                          : b.status === 'CANCELLED'
                          ? 'bg-red-950 border border-red-700 text-red-300'
                          : 'bg-yellow-950 border border-yellow-700 text-yellow-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold ${b.checkedIn ? 'text-amber-400' : 'text-gray-400'}`}>
                        {b.checkedIn ? 'Checked In' : 'Pending Entry'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/ticket/${b.bookingReference}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
