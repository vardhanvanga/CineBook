'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/components/ui/Toaster';
import { ShieldCheck, AlertCircle, CheckCircle, XCircle, CreditCard, Smartphone, Building, RefreshCw, ArrowLeft } from 'lucide-react';

interface BookingDetail {
  id: string;
  bookingReference: string;
  totalAmount: number;
  status: string;
  show: {
    movie: {
      title: string;
    };
    screen: {
      theatre: {
        name: string;
      };
    };
  };
  seats: {
    seat: {
      rowLabel: string;
      seatNumber: number;
    };
  }[];
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paymentResult, setPaymentResult] = useState<{ status: 'FAILED' | 'ERROR'; message: string } | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data.booking);
        } else {
          showToast('Failed to load order', 'error');
        }
      } catch (err) {
        console.error('Failed to load booking for payment', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [bookingId]);

  const handleSimulatePayment = async (action: 'SUCCESS' | 'FAILURE') => {
    setProcessing(true);
    setPaymentResult(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          action,
        }),
      });

      const data = await res.json();

      if (res.ok && action === 'SUCCESS') {
        showToast('Payment successful! Booking confirmed.', 'success');
        router.push(`/booking/success/${data.booking.bookingReference}`);
      } else {
        const errMsg = data.error || (action === 'FAILURE' ? 'Payment was declined by the bank simulator.' : 'Payment processing failed.');
        setPaymentResult({
          status: 'FAILED',
          message: errMsg,
        });
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.error('Payment simulation error', err);
      setPaymentResult({
        status: 'ERROR',
        message: 'Network error or transaction timeout. Please retry.',
      });
      showToast('Payment processing error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
        <p>Order not found or already processed.</p>
        <Link href="/my-bookings" className="text-purple-400 underline mt-3 inline-block">Go to My Bookings</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.push(`/checkout/${booking.id}`)}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Order Summary
          </button>
          <h1 className="text-3xl font-extrabold text-white">Payment Gateway</h1>
          <p className="text-gray-400 text-sm mt-1.5">Complete your payment to confirm your movie tickets</p>
        </div>

        {/* Academic Demo Mode Disclaimer Banner */}
        <div className="bg-purple-950/60 border border-purple-600/50 rounded-3xl p-5 sm:p-6 mb-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-purple-200 block mb-1">Academic Demo Payment Mode</span>
              <p className="text-purple-300/80 leading-relaxed">
                This project runs in simulated payment mode for demonstration. No real money or card credentials will be charged.
                Choose between simulating a successful confirmation or a declined payment.
              </p>
            </div>
          </div>
        </div>

        {/* Order Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start pb-6 border-b border-gray-800 gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">{booking.show.movie.title}</h3>
              <p className="text-sm text-gray-400">{booking.show.screen.theatre.name}</p>
              <p className="text-xs sm:text-sm text-purple-400 font-medium pt-1">
                Seats: {booking.seats.map(s => `${s.seat.rowLabel}${s.seat.seatNumber}`).join(', ')}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs text-gray-400 block mb-0.5">Total Amount</span>
              <span className="text-3xl font-black text-purple-400">₹{booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Choose Simulated Method</h4>
            <div className="grid grid-cols-3 gap-4 sm:gap-5">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all text-xs sm:text-sm font-semibold cursor-pointer ${
                  selectedMethod === 'upi'
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Smartphone className="w-6 h-6 text-purple-400" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all text-xs sm:text-sm font-semibold cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <CreditCard className="w-6 h-6 text-purple-400" />
                <span>Debit/Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('netbanking')}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all text-xs sm:text-sm font-semibold cursor-pointer ${
                  selectedMethod === 'netbanking'
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30'
                    : 'bg-gray-800/60 border-gray-700/60 text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                <Building className="w-6 h-6 text-purple-400" />
                <span>Net Banking</span>
              </button>
            </div>
          </div>
        </div>

        {/* Payment Error / Failure Message */}
        {paymentResult && (
          <div className="bg-red-950/80 border border-red-700/80 rounded-3xl p-6 mb-8 text-red-200 flex items-start gap-4 shadow-xl">
            <XCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-base">Payment Unsuccessful</h4>
              <p className="text-xs sm:text-sm text-red-300/90 leading-relaxed">{paymentResult.message}</p>
              <p className="text-xs text-red-400 pt-1">You can retry payment or return to select new seats.</p>
            </div>
          </div>
        )}

        {/* Action Buttons: Simulated Success vs Failure */}
        <div className="space-y-4 pt-2">
          <button
            disabled={processing}
            onClick={() => handleSimulatePayment('SUCCESS')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 sm:py-4.5 px-6 rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 text-base sm:text-lg disabled:opacity-50 cursor-pointer"
          >
            {processing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            Simulate Payment Success (Pay ₹{booking.totalAmount.toFixed(2)})
          </button>

          <button
            disabled={processing}
            onClick={() => handleSimulatePayment('FAILURE')}
            className="w-full bg-gray-900 hover:bg-red-950/80 border border-gray-700 hover:border-red-700 text-gray-300 hover:text-red-300 font-semibold py-3.5 sm:py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-5 h-5 text-red-400" />
            Simulate Payment Failure (Test Decline Flow)
          </button>
        </div>
      </div>
    </div>
  );
}
