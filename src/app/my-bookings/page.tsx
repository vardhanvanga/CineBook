'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { Ticket, Film, Calendar, Clock, MapPin, AlertTriangle, X, CheckCircle, RefreshCcw } from 'lucide-react';

interface BookingItem {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  cancellation?: {
    refundAmount: number;
    status: string;
  } | null;
  show: {
    startTime: string;
    movie: {
      id: string;
      title: string;
      posterUrl?: string | null;
      genre: string | string[];
    };
    screen: {
      name: string;
      theatre: {
        name: string;
        area: string;
        city: string;
      };
    };
  };
  seats: {
    category: string;
    seat: {
      rowLabel: string;
      seatNumber: number;
    };
  }[];
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null);
  const [cancellingLoading, setCancellingLoading] = useState(false);

  async function loadBookings() {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancellingLoading(true);

    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.bookingReference}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Booking cancelled successfully! Refund simulated.', 'success');
        setCancellingBooking(null);
        loadBookings();
      } else {
        showToast(data.error || 'Failed to cancel booking', 'error');
      }
    } catch (err) {
      console.error('Cancel booking error', err);
      showToast('Error cancelling booking', 'error');
    } finally {
      setCancellingLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const now = new Date();
  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.show.startTime) > now);
  const pastBookings = bookings.filter(b => (b.status === 'CONFIRMED' && new Date(b.show.startTime) <= now) || b.status === 'FAILED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  const displayedList = tab === 'UPCOMING' ? upcomingBookings : tab === 'PAST' ? pastBookings : cancelledBookings;

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
            <p className="text-gray-400 text-sm mt-1">View tickets, manage upcoming reservations, and track refund status</p>
          </div>
          <Link
            href="/movies"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors self-start sm:self-auto shadow-lg shadow-purple-600/30"
          >
            Book New Movie
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 border-b border-gray-800 pb-5 mb-10">
          <button
            onClick={() => setTab('UPCOMING')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'UPCOMING'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            Upcoming Shows ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setTab('PAST')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'PAST'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            Past Shows ({pastBookings.length})
          </button>
          <button
            onClick={() => setTab('CANCELLED')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'CANCELLED'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
            }`}
          >
            Cancelled ({cancelledBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {displayedList.length > 0 ? (
          <div className="space-y-6">
            {displayedList.map(b => {
              const showTime = new Date(b.show.startTime).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row gap-6 items-start justify-between shadow-xl">
                  <div className="flex gap-5 items-start">
                    <div className="relative w-24 h-32 bg-gray-800 rounded-2xl overflow-hidden shrink-0 border border-gray-700 shadow-md">
                      {b.show.movie.posterUrl ? (
                        <Image src={b.show.movie.posterUrl} alt={b.show.movie.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full"><Film className="w-8 h-8 text-gray-600" /></div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-950 border border-red-700 text-red-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {b.status}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Ref: {b.bookingReference}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white">{b.show.movie.title}</h3>
                      <p className="text-xs sm:text-sm text-purple-400 font-semibold">{b.show.screen.theatre.name} — {b.show.screen.name}</p>
                      <p className="text-xs sm:text-sm text-gray-400 pt-0.5">📅 {showTime}</p>
                      <p className="text-xs sm:text-sm text-gray-300 font-medium pt-0.5">
                        Seats: <span className="text-purple-300 font-bold">{b.seats.map(s => `${s.seat.rowLabel}${s.seat.seatNumber}`).join(', ')}</span> ({b.seats.length} Tickets)
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold block">Total Amount</span>
                      <span className="text-xl font-black text-white">₹{b.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {b.status === 'CONFIRMED' && (
                        <>
                          <Link
                            href={`/ticket/${b.bookingReference}`}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                          >
                            <Ticket className="w-4 h-4" /> Ticket
                          </Link>

                          {new Date(b.show.startTime) > now && (
                            <button
                              onClick={() => setCancellingBooking(b)}
                              className="bg-gray-800 hover:bg-red-950/80 border border-gray-700 hover:border-red-700 text-gray-300 hover:text-red-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </>
                      )}

                      {b.status === 'CANCELLED' && b.cancellation && (
                        <span className="text-xs sm:text-sm text-red-400 bg-red-950/60 border border-red-800 px-3.5 py-2 rounded-xl font-medium">
                          Refund: ₹{b.cancellation.refundAmount.toFixed(2)} ({b.cancellation.status})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-16 text-center text-gray-400">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <h3 className="text-lg font-bold text-white mb-1">No {tab.toLowerCase()} bookings found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              You haven't made any cinema ticket bookings in this category yet.
            </p>
            <Link
              href="/movies"
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors inline-block"
            >
              Browse Movies Now
            </Link>
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-white">Cancel Booking?</h3>
              </div>

              <p className="text-sm text-gray-300 mb-3">
                Are you sure you want to cancel your tickets for{' '}
                <strong className="text-white">{cancellingBooking.show.movie.title}</strong>?
              </p>

              <div className="bg-gray-800/80 border border-gray-700/60 rounded-xl p-3.5 mb-6 text-xs text-gray-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Booking Reference:</span>
                  <span className="font-mono text-purple-400">{cancellingBooking.bookingReference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span>₹{cancellingBooking.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-gray-700">
                  <span>Refund Amount (75% Policy):</span>
                  <span>₹{(cancellingBooking.totalAmount * 0.75).toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-gray-400 italic pt-1">
                  Cancellation policy: Permitted up to 2 hours before showtime.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  Keep Tickets
                </button>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancellingLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {cancellingLoading ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
