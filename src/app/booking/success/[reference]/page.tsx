'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { CheckCircle2, Ticket, Home, QrCode, MapPin, Calendar, Clock, Film } from 'lucide-react';
import QRCode from 'qrcode';

interface BookingConfirmed {
  id: string;
  bookingReference: string;
  verificationToken: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  payment?: {
    providerReference?: string | null;
    status: string;
  } | null;
  show: {
    startTime: string;
    movie: {
      title: string;
      certification: string;
      posterUrl?: string | null;
    };
    screen: {
      name: string;
      theatre: {
        name: string;
        address: string;
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

export default function BookingSuccessPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [booking, setBooking] = useState<BookingConfirmed | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    async function loadConfirmedBooking() {
      try {
        const res = await fetch(`/api/bookings/${reference}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);

          // Generate QR code for verification token
          if (data.booking?.verificationToken || data.booking?.bookingReference) {
            const token = data.booking.verificationToken || data.booking.bookingReference;
            const url = await QRCode.toDataURL(token, {
              width: 200,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            setQrCodeDataUrl(url);
          }
        }
      } catch (err) {
        console.error('Error fetching confirmed booking', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfirmedBooking();
  }, [reference]);

  if (loading) return <PageLoader />;
  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Booking confirmation details could not be found.</p>
        <Link href="/" className="text-purple-400 underline mt-3 inline-block">Go to Home</Link>
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
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Transaction Successful</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Booking Confirmed!</h1>
          <p className="text-gray-400 text-sm mt-1">
            Booking ID: <span className="font-mono font-bold text-purple-400">{booking.bookingReference}</span>
          </p>
        </div>

        {/* Digital Ticket Card Preview */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row gap-5 items-start justify-between">
            <div className="flex gap-4 items-start">
              <div className="relative w-20 h-28 bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-700">
                {booking.show.movie.posterUrl ? (
                  <Image src={booking.show.movie.posterUrl} alt={booking.show.movie.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex items-center justify-center h-full"><Film className="w-8 h-8 text-gray-600" /></div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{booking.show.movie.title}</h3>
                <p className="text-sm text-purple-400 font-medium mt-0.5">{booking.show.screen.theatre.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {booking.show.screen.theatre.address}
                </p>
                <p className="text-xs text-gray-300 font-medium mt-1">
                  {booking.show.screen.name}
                </p>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="bg-white p-2 rounded-2xl shrink-0 self-center sm:self-auto border border-gray-200">
                <Image src={qrCodeDataUrl} alt="Ticket QR Verification Code" width={96} height={96} unoptimized />
                <span className="text-[9px] text-gray-900 font-bold block text-center mt-1">SCAN AT GATE</span>
              </div>
            )}
          </div>

          {/* Booking Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-gray-900/60 border-b border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block mb-0.5">Show Timing</span>
              <span className="text-white font-bold">{showTimeFormatted}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Seats</span>
              <span className="text-purple-400 font-bold text-sm">
                {booking.seats.map(s => `${s.seat.rowLabel}${s.seat.seatNumber}`).join(', ')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Tickets</span>
              <span className="text-white font-bold">{booking.seats.length} Person(s)</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">Amount Paid</span>
              <span className="text-emerald-400 font-bold text-sm">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {booking.payment?.providerReference && (
            <div className="px-6 py-3 bg-gray-950/60 text-[11px] text-gray-400 flex justify-between items-center">
              <span>Payment Ref: <code className="text-gray-300">{booking.payment.providerReference}</code></span>
              <span className="text-emerald-400 font-semibold">Payment Status: Confirmed</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href={`/ticket/${booking.bookingReference}`}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-purple-600/30"
          >
            <Ticket className="w-4 h-4" /> View / Print Ticket
          </Link>

          <Link
            href="/my-bookings"
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-sm"
          >
            Go to My Bookings
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 font-medium py-3.5 px-4 rounded-xl transition-colors text-sm"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
