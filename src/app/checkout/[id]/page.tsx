'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { ShieldCheck, Clock, MapPin, Film, ArrowRight, ArrowLeft } from 'lucide-react';

interface BookingDetail {
  id: string;
  bookingReference: string;
  status: string;
  subtotal: number;
  convenienceFee: number;
  tax: number;
  totalAmount: number;
  show: {
    id: string;
    startTime: string;
    movie: {
      id: string;
      title: string;
      certification: string;
      posterUrl?: string | null;
      durationMinutes: number;
    };
    screen: {
      name: string;
      theatre: {
        name: string;
        address: string;
        area: string;
        city: string;
      };
    };
  };
  seats: {
    priceAtBooking: number;
    category: string;
    seat: {
      rowLabel: string;
      seatNumber: number;
    };
  }[];
}

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);
        } else {
          showToast('Failed to load checkout details', 'error');
        }
      } catch (err) {
        console.error('Checkout load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      showToast('Reservation expired. Please select your seats again.', 'error');
      if (booking?.show?.id) {
        router.push(`/shows/${booking.show.id}/seats`);
      } else {
        router.push('/movies');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, booking, router]);

  if (loading) return <PageLoader />;
  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Order not found or has expired.</p>
        <Link href="/movies" className="text-purple-400 underline mt-3 inline-block">Return to Movies</Link>
      </div>
    );
  }

  const showTimeFormatted = new Date(booking.show.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push(`/shows/${booking.show.id}/seats`)}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Change Seats
          </button>
          
          <div className="flex items-center gap-2.5 bg-yellow-950/80 border border-yellow-700/80 text-yellow-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Order Summary</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">Review your movie show details and ticket pricing before proceeding to payment.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden mb-8 shadow-xl">
          {/* Movie & Theatre Card */}
          <div className="p-6 sm:p-8 border-b border-gray-800 flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative w-28 h-36 bg-gray-800 rounded-2xl overflow-hidden shrink-0 border border-gray-700 shadow-md">
              {booking.show.movie.posterUrl ? (
                <Image src={booking.show.movie.posterUrl} alt={booking.show.movie.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex items-center justify-center h-full"><Film className="w-10 h-10 text-gray-600" /></div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {booking.show.movie.certification}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {Math.floor(booking.show.movie.durationMinutes / 60)}h {booking.show.movie.durationMinutes % 60}m
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{booking.show.movie.title}</h2>
              <p className="text-sm sm:text-base text-purple-400 font-semibold">{booking.show.screen.theatre.name} — {booking.show.screen.name}</p>
              <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 pt-0.5">
                <MapPin className="w-4 h-4 text-purple-400 shrink-0" /> {booking.show.screen.theatre.address}
              </p>
              <p className="text-xs sm:text-sm text-gray-300 font-medium pt-1">
                📅 {showTimeFormatted}
              </p>
            </div>
          </div>

          {/* Seats Detail */}
          <div className="p-6 sm:p-8 border-b border-gray-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Selected Seats ({booking.seats.length})</h3>
            <div className="flex flex-wrap gap-3">
              {booking.seats.map((s, idx) => (
                <div key={idx} className="bg-gray-800/90 border border-gray-700/80 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                  <span className="font-bold text-white text-sm sm:text-base">{s.seat.rowLabel}{s.seat.seatNumber}</span>
                  <span className="text-[11px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800 font-medium">
                    {s.category}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-300 font-semibold">₹{s.priceAtBooking}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="p-6 sm:p-8 space-y-4 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Ticket Subtotal</span>
              <span className="font-medium text-white">₹{booking.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Convenience Fee</span>
              <span className="font-medium text-white">₹{booking.convenienceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Integrated GST (18%)</span>
              <span className="font-medium text-white">₹{booking.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-base sm:text-lg font-bold text-white">
              <span>Total Payable</span>
              <span className="text-2xl font-black text-purple-400">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security & Action */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-400 mb-8 bg-gray-900/80 border border-gray-800 p-4 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>All transactions are secure and encrypted. Demo simulated payment mode active.</span>
        </div>

        <button
          onClick={() => router.push(`/payment/${booking.id}`)}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 sm:py-4.5 px-6 rounded-2xl transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 text-base sm:text-lg cursor-pointer"
        >
          Proceed to Payment (₹{booking.totalAmount.toFixed(2)})
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
