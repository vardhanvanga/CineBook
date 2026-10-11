import Link from 'next/link';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does temporary seat reservation work?',
      a: 'When you select seats and proceed to checkout, CineBook places a 5-minute server-side lock on those specific seats. During this window, no other user can book or select them. Once the timer reaches 0, the lock expires automatically if payment has not been completed.',
    },
    {
      q: 'Can I cancel my confirmed movie tickets?',
      a: 'Yes! You can cancel your tickets up to 2 hours before showtime directly from the My Bookings page. As per the demo cancellation policy, a 75% refund is processed.',
    },
    {
      q: 'How do I use my digital movie ticket at the cinema?',
      a: 'After confirmation, you can view your digital ticket on your mobile device or print it. Each ticket contains a unique signed verification QR code. Show this QR code to the usher at the theatre entrance for instant scanning and check-in.',
    },
    {
      q: 'What payment modes are accepted in demo mode?',
      a: 'This academic deployment features an interactive Payment Simulator. You can simulate instant payment success or test error/decline scenarios without requiring real debit cards or UPI pins.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white text-center mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-400 text-sm text-center mb-10">Everything you need to know about booking movie tickets on CineBook</p>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold text-white text-base mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
