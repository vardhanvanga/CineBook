'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Printer, Download, ArrowLeft, Film, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface BookingTicket {
  id: string;
  bookingReference: string;
  verificationToken: string;
  totalAmount: number;
  status: string;
  checkedIn: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone?: string | null;
  };
  show: {
    startTime: string;
    movie: {
      title: string;
      certification: string;
      posterUrl?: string | null;
      durationMinutes: number;
      language: string | string[];
    };
    screen: {
      name: string;
      theatre: {
        name: string;
        address: string;
        city: string;
        area: string;
      };
    };
  };
  seats: {
    category: string;
    priceAtBooking: number;
    seat: {
      rowLabel: string;
      seatNumber: number;
    };
  }[];
}

export default function DigitalTicketPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const [ticket, setTicket] = useState<BookingTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/bookings/${reference}`);
        if (res.ok) {
          const data = await res.json();
          setTicket(data.booking);

          const token = data.booking?.verificationToken || data.booking?.bookingReference;
          if (token) {
            const url = await QRCode.toDataURL(token, {
              width: 250,
              margin: 1,
              color: { dark: '#000000', light: '#ffffff' },
            });
            setQrCodeUrl(url);
          }
        }
      } catch (err) {
        console.error('Failed to load ticket', err);
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [reference]);

  if (loading) return <PageLoader />;
  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Ticket not found or unauthorized.</p>
        <Link href="/my-bookings" className="text-purple-400 underline mt-3 inline-block">My Bookings</Link>
      </div>
    );
  }

  const showTime = new Date(ticket.show.startTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const languages = Array.isArray(ticket.show.movie.language)
    ? ticket.show.movie.language.join(', ')
    : ticket.show.movie.language;

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/my-bookings"
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Bookings
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-purple-400" /> Print Ticket
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold px-4.5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {/* Printable Digital Cinema Ticket */}
        <div className="bg-white text-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          {/* Ticket Header */}
          <div className="bg-purple-900 text-white p-7 relative">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest text-purple-300 font-bold block mb-1">
                  CineBook E-Ticket
                </span>
                <h1 className="text-2xl sm:text-3xl font-black">{ticket.show.movie.title}</h1>
                <p className="text-xs sm:text-sm text-purple-200 pt-0.5">
                  {languages} • {ticket.show.movie.certification} • {Math.floor(ticket.show.movie.durationMinutes / 60)}h {ticket.show.movie.durationMinutes % 60}m
                </p>
              </div>
              <span className="bg-emerald-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {ticket.status}
              </span>
            </div>

            {/* Theatre & Screen */}
            <div className="mt-5 pt-4 border-t border-purple-800/80 text-xs sm:text-sm text-purple-100 flex flex-col gap-1">
              <span className="font-bold text-sm sm:text-base text-white">{ticket.show.screen.theatre.name}</span>
              <span className="text-purple-200">{ticket.show.screen.name} — {ticket.show.screen.theatre.address}</span>
            </div>
          </div>

          {/* Ticket Perforated Tear Line */}
          <div className="relative border-b-2 border-dashed border-gray-300 bg-gray-100 py-2 px-6 flex justify-between items-center text-xs text-gray-500 font-mono">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-950 rounded-full" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-950 rounded-full" />
            <span>REFERENCE: {ticket.bookingReference}</span>
            <span>{ticket.seats.length} SEAT(S)</span>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Date & Showtime</span>
                <span className="font-bold text-gray-900">{showTime}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Seats</span>
                <span className="font-black text-purple-700 text-lg">
                  {ticket.seats.map(s => `${s.seat.rowLabel}${s.seat.seatNumber}`).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Customer</span>
                <span className="font-semibold text-gray-900">{ticket.user.name}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Total Amount Paid</span>
                <span className="font-bold text-emerald-700 text-base">₹{ticket.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code Validation Section */}
            <div className="pt-6 flex flex-col items-center text-center">
              {qrCodeUrl ? (
                <div className="border-2 border-gray-200 p-2 rounded-2xl bg-white shadow-sm mb-2">
                  <Image src={qrCodeUrl} alt="Digital Gate Entry QR Code" width={140} height={140} unoptimized />
                </div>
              ) : null}
              <span className="text-xs font-mono font-bold tracking-wider text-gray-700">
                {ticket.verificationToken || ticket.bookingReference}
              </span>
              <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                Scan this QR code at cinema turnstile or usher checkpoint for admission. Valid for one-time entry.
              </p>
              {ticket.checkedIn && (
                <span className="mt-2 text-xs bg-gray-200 text-gray-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Already Checked In
                </span>
              )}
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-center text-[10px] text-gray-500">
            CineBook Hyderabad • Electronic Admission Pass • Non-Transferable
          </div>
        </div>
      </div>
    </div>
  );
}
