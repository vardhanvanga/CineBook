'use client';
import { useState } from 'react';
import { showToast } from '@/components/ui/Toaster';
import { ShieldCheck, CheckCircle2, XCircle, Search, Clock, Film, MapPin, User, Check } from 'lucide-react';

interface VerifiedTicket {
  valid: boolean;
  checkedIn: boolean;
  booking?: {
    reference: string;
    status: string;
    customerName: string;
    movie: string;
    theatre: string;
    showTime: string;
    seats: string[];
  };
  error?: string;
}

export default function VerifyTicketPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<VerifiedTicket | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setTicketData(null);
    try {
      const res = await fetch(`/api/verify-ticket?token=${encodeURIComponent(tokenInput.trim())}`);
      const data = await res.json();
      setTicketData(data);
      if (data.valid) {
        showToast('Ticket is valid!', 'success');
      } else {
        showToast(data.error || 'Ticket is not valid', 'error');
      }
    } catch (err) {
      console.error('Verify error', err);
      showToast('Verification request failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!tokenInput.trim()) return;
    setCheckingIn(true);
    try {
      const res = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Customer checked in successfully!', 'success');
        setTicketData(prev => prev ? { ...prev, checkedIn: true } : null);
      } else {
        showToast(data.error || 'Check-in failed', 'error');
      }
    } catch (err) {
      console.error('Check-in error', err);
      showToast('Error during check-in', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-900/40 border border-purple-600/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-purple-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cinema Staff Ticket Verification</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Validate digital tickets and perform one-time entry check-in
          </p>
        </div>

        {/* Search / Scan Input */}
        <form onSubmit={handleVerify} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 shadow-xl">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
            Enter Booking Reference or QR Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. clx... or booking reference"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Verify
            </button>
          </div>
        </form>

        {/* Result Card */}
        {ticketData && (
          <div className={`border rounded-2xl p-6 shadow-xl ${
            ticketData.valid
              ? 'bg-gray-900 border-gray-700'
              : 'bg-red-950/40 border-red-800 text-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
              {ticketData.valid ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-lg">Valid Ticket</h3>
                    <p className="text-xs text-emerald-400 font-medium">Ready for admission</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <h3 className="font-bold text-red-100 text-lg">Invalid or Expired Ticket</h3>
                    <p className="text-xs text-red-400">{ticketData.error || 'Record does not match a confirmed booking'}</p>
                  </div>
                </>
              )}
            </div>

            {ticketData.booking && (
              <div className="space-y-4 text-sm text-gray-300">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-800/80">
                  <div>
                    <span className="text-xs text-gray-500 block">Movie</span>
                    <span className="font-bold text-white text-base">{ticketData.booking.movie}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Customer</span>
                    <span className="font-semibold text-white">{ticketData.booking.customerName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block">Cinema & Showtime</span>
                  <span className="font-medium text-white">{ticketData.booking.theatre}</span>
                  <span className="text-xs text-gray-400 block mt-0.5">
                    {new Date(ticketData.booking.showTime).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">Seats</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ticketData.booking.seats.map((s, idx) => (
                      <span key={idx} className="bg-purple-900/60 border border-purple-700 text-purple-200 font-bold px-2 py-0.5 rounded text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Check-In Status */}
                <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">Check-in Status</span>
                    <span className={`text-xs font-bold ${ticketData.checkedIn ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {ticketData.checkedIn ? 'Already Admitted' : 'Not Yet Checked In'}
                    </span>
                  </div>

                  {!ticketData.checkedIn && (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" /> Mark Checked In
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
