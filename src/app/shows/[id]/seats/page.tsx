'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { Clock, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface Seat {
  id: string;
  rowLabel: string;
  seatNumber: number;
  category: string; // REGULAR | PREMIUM | RECLINER | ACCESSIBLE
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
}

interface ShowDetail {
  id: string;
  startTime: string;
  regularPrice: number;
  premiumPrice: number;
  reclinerPrice: number;
  convenienceFee: number;
  taxRate: number;
  movie: {
    id: string;
    title: string;
    certification: string;
    durationMinutes: number;
  };
  screen: {
    id: string;
    name: string;
    layoutConfig?: string | null;
    theatre: {
      name: string;
      area: string;
      city: string;
    };
    seats: Seat[];
  };
}

const MAX_SEATS = 6;

export default function SeatSelectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: showId } = use(params);
  const router = useRouter();

  const [show, setShow] = useState<ShowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [reserving, setReserving] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch show details & seats
  async function loadShowData() {
    try {
      const res = await fetch(`/api/shows/${showId}`);
      if (res.ok) {
        const data = await res.json();
        setShow(data.show);
      } else {
        showToast('Show not found or unavailable', 'error');
      }
    } catch (err) {
      console.error('Failed to load show seats', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShowData();
    // Live Polling every 10 seconds to sync seat availability
    const pollInterval = setInterval(() => {
      fetch(`/api/shows/${showId}/seats`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.seats && show) {
            setShow(prev => {
              if (!prev) return null;
              return {
                ...prev,
                screen: {
                  ...prev.screen,
                  seats: data.seats,
                },
              };
            });
          }
        });
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [showId]);

  // Countdown timer when reservation is active
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      showToast('Your temporary seat reservation has expired. Please reselect seats.', 'error');
      setSelectedSeatIds([]);
      setTimeLeft(null);
      loadShowData();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

  if (loading) return <PageLoader />;
  if (!show) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-gray-400">
        <p className="text-lg">Show details could not be loaded.</p>
        <Link href="/movies" className="text-purple-400 font-semibold underline mt-4 inline-block">Return to Movies</Link>
      </div>
    );
  }

  // Group seats by row
  const rowsMap: { [row: string]: Seat[] } = {};
  (show.screen.seats || []).forEach(seat => {
    if (!rowsMap[seat.rowLabel]) rowsMap[seat.rowLabel] = [];
    rowsMap[seat.rowLabel].push(seat);
  });
  // Sort rows and seats
  const sortedRowKeys = Object.keys(rowsMap).sort();
  sortedRowKeys.forEach(row => {
    rowsMap[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= MAX_SEATS) {
        showToast(`You can only select up to ${MAX_SEATS} seats per booking`, 'warning');
        return;
      }
      setSelectedSeatIds(prev => [...prev, seat.id]);
    }
  };

  // Pricing calculation for selected seats
  const selectedSeats = (show.screen.seats || []).filter(s => selectedSeatIds.includes(s.id));
  const subtotal = selectedSeats.reduce((acc, s) => {
    if (s.category === 'PREMIUM') return acc + show.premiumPrice;
    if (s.category === 'RECLINER') return acc + show.reclinerPrice;
    return acc + show.regularPrice;
  }, 0);

  // Reserve seats & Proceed to checkout
  const handleProceed = async () => {
    if (selectedSeatIds.length === 0) {
      showToast('Please select at least 1 seat', 'warning');
      return;
    }

    setReserving(true);
    try {
      // 1. Check user login session
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        showToast('Please login to reserve seats', 'warning');
        router.push(`/login?redirect=/shows/${showId}/seats`);
        return;
      }

      // 2. Lock / Reserve seats on the server
      const reserveRes = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, seatIds: selectedSeatIds }),
      });

      const reserveData = await reserveRes.json();
      if (!reserveRes.ok) {
        showToast(reserveData.error || 'Failed to lock seats. Please try other seats.', 'error');
        loadShowData();
        setReserving(false);
        return;
      }

      // 3. Create pending booking order
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showId, seatIds: selectedSeatIds }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        showToast(bookingData.error || 'Booking creation failed.', 'error');
        setReserving(false);
        return;
      }

      showToast('Seats temporarily reserved for 5 minutes!', 'success');
      router.push(`/checkout/${bookingData.booking.id}`);
    } catch (err) {
      console.error('Reservation error', err);
      showToast('An error occurred while locking seats.', 'error');
      setReserving(false);
    }
  };

  const showTimeFormatted = new Date(show.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-950 pb-36 sm:pb-40">
      {/* Sticky Top Header Bar */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-[72px] z-30 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                <span className="truncate">{show.movie.title}</span>
                <span className="text-[11px] bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-800 shrink-0 font-medium">
                  {show.movie.certification || 'UA'}
                </span>
              </h1>
              <p className="text-xs text-gray-400 truncate">
                {show.screen.theatre.name} • {show.screen.name} • {showTimeFormatted}
              </p>
            </div>
          </div>

          {timeLeft !== null && (
            <div className="flex items-center gap-2 bg-yellow-950/80 border border-yellow-700 text-yellow-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto shadow-md shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
              <span>Seat lock expiring in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Cinema Screen Indicator */}
        <div className="w-full max-w-xl mx-auto mb-6 sm:mb-8 text-center">
          <div className="h-2 w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full shadow-[0_0_20px_rgba(168,85,247,0.7)] mb-2.5" />
          <span className="text-[11px] tracking-[0.3em] font-semibold text-gray-400 uppercase">Screen This Way</span>
        </div>

        {/* Seating Map (Scrollable on small mobile only, perfectly centered on desktop) */}
        <div className="overflow-x-auto w-full max-w-full pb-4 px-2 no-scrollbar">
          <div className="min-w-fit mx-auto flex flex-col items-center gap-2.5 sm:gap-3">
            {sortedRowKeys.map(rowLabel => {
              const rowSeats = rowsMap[rowLabel];

              return (
                <div key={rowLabel} className="flex items-center gap-2 sm:gap-3">
                  {/* Row Label Left */}
                  <span className="w-6 text-center text-xs font-bold text-gray-400 shrink-0">{rowLabel}</span>

                  {/* Seat Buttons in Row */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {rowSeats.map(seat => {
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isBooked = seat.status === 'BOOKED';
                      const isReserved = seat.status === 'RESERVED';

                      let seatClasses = 'w-7 h-7 sm:w-8 sm:h-8 text-[11px] rounded-lg font-semibold flex items-center justify-center transition-all shrink-0 select-none ';

                      if (isSelected) {
                        seatClasses += 'bg-purple-600 text-white shadow-md shadow-purple-600/50 scale-105 border border-purple-300 font-bold';
                      } else if (isBooked) {
                        seatClasses += 'bg-gray-800 text-gray-600 border border-gray-800 cursor-not-allowed opacity-40';
                      } else if (isReserved) {
                        seatClasses += 'bg-amber-950/80 text-amber-500 border border-amber-700/60 cursor-not-allowed opacity-75';
                      } else {
                        // Available
                        if (seat.category === 'PREMIUM') {
                          seatClasses += 'bg-gray-900 border border-amber-500/70 text-amber-300 hover:bg-amber-600 hover:text-white cursor-pointer';
                        } else if (seat.category === 'RECLINER') {
                          seatClasses += 'bg-gray-900 border border-emerald-500/70 text-emerald-300 hover:bg-emerald-600 hover:text-white cursor-pointer';
                        } else {
                          seatClasses += 'bg-gray-900 border border-gray-700 text-gray-300 hover:border-purple-500 hover:bg-gray-800 hover:text-white cursor-pointer';
                        }
                      }

                      // Aisle spacing after middle column (e.g. seat 7)
                      const isAisle = seat.seatNumber === 7;

                      return (
                        <div key={seat.id} className="flex items-center">
                          <button
                            type="button"
                            disabled={isBooked || isReserved}
                            onClick={() => handleSeatClick(seat)}
                            title={`${rowLabel}${seat.seatNumber} • ${seat.category} (₹${seat.category === 'PREMIUM' ? show.premiumPrice : seat.category === 'RECLINER' ? show.reclinerPrice : show.regularPrice}) • ${seat.status}`}
                            className={seatClasses}
                          >
                            {seat.seatNumber}
                          </button>
                          {isAisle && <div className="w-5 sm:w-8 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Row Label Right */}
                  <span className="w-6 text-center text-xs font-bold text-gray-400 shrink-0">{rowLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seat Legend - Fully Visible, Responsive & Centered */}
        <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8 bg-gray-900/90 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3.5 text-center">
            Seat Categories & Availability
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-900 border border-gray-700 rounded" />
              <span className="text-gray-300">Regular (₹{show.regularPrice})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-900 border border-amber-500 rounded" />
              <span className="text-gray-300">Premium (₹{show.premiumPrice})</span>
            </div>
            {show.reclinerPrice > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-900 border border-emerald-500 rounded" />
                <span className="text-gray-300">Recliner (₹{show.reclinerPrice})</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 border border-purple-400 rounded" />
              <span className="text-gray-300">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-950 border border-amber-700 rounded" />
              <span className="text-gray-300">Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border border-gray-800 rounded opacity-50" />
              <span className="text-gray-300">Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Booking Summary Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 py-3.5 sm:py-4 px-4 sm:px-6 z-40 shadow-2xl">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Selected Seats ({selectedSeats.length}/{MAX_SEATS}):</span>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSeats.map(s => (
                    <span key={s.id} className="text-xs bg-purple-900/70 border border-purple-700 text-purple-200 font-bold px-2 py-0.5 rounded-md">
                      {s.rowLabel}{s.seatNumber}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500 italic">None selected</span>
              )}
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Subtotal: <span className="text-purple-400 text-lg sm:text-xl font-black">₹{subtotal}</span></span>
              <span className="text-[11px] text-gray-400 font-normal">(+ Convenience fees & GST at checkout)</span>
            </div>
          </div>

          <button
            type="button"
            disabled={selectedSeatIds.length === 0 || reserving}
            onClick={handleProceed}
            className={`flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shrink-0 ${
              selectedSeatIds.length > 0 && !reserving
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            {reserving ? 'Locking Seats...' : selectedSeatIds.length === 0 ? 'Select Seats to Proceed' : `Proceed to Checkout (₹${subtotal})`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
