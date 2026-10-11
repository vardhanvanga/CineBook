import Link from 'next/link';
import { Film, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-purple-600/30">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">About CineBook</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
            A state-of-the-art cinema ticketing platform designed for movie lovers across Hyderabad.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl space-y-6 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Our Mission</h2>
            <p>
              CineBook delivers an effortless, lightning-fast movie ticketing experience inspired by world-class platforms. From instant seat locking to contactless digital QR check-in, every aspect of our architecture is built with reliability, speed, and concurrency control in mind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">Academic Project Context</h2>
            <p>
              Developed as a senior full-stack software engineering project, CineBook demonstrates robust software architecture, ACID database transactions, concurrency locking for seat inventory, and cryptographic digital tickets.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-800 text-center">
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-xs mb-1">Concurrency Safe</h3>
              <p className="text-[11px] text-gray-400">Zero double-booking guarantees</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <HeartHandshake className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-xs mb-1">Instant Refunds</h3>
              <p className="text-[11px] text-gray-400">Automated cancellation policy</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
              <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h3 className="font-bold text-white text-xs mb-1">QR E-Tickets</h3>
              <p className="text-[11px] text-gray-400">Contactless verification</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/movies" className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline">
            Explore Currently Running Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
