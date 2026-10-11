import Link from 'next/link';
import { Film, ShieldCheck, MapPin, Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-900 mt-20 sm:mt-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (2 columns wide on desktop) */}
          <div className="col-span-2 space-y-4 pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-gradient-to-tr from-purple-700 to-purple-500 p-2 rounded-xl shadow-lg shadow-purple-600/30">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Cine<span className="text-purple-400">Book</span>
              </span>
            </Link>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Hyderabad's premier movie ticketing platform. Featuring atomic seat reservation locking, instant booking confirmations, and contactless QR admissions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                Hyderabad, Telangana
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-medium text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Secure Payments
              </span>
            </div>
          </div>

          {/* Movies Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-gray-200">
              Movies & Shows
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/movies?status=NOW_SHOWING" className="hover:text-purple-400 transition-colors inline-block">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link href="/movies?status=COMING_SOON" className="hover:text-purple-400 transition-colors inline-block">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link href="/theatres" className="hover:text-purple-400 transition-colors inline-block">
                  Popular Theatres
                </Link>
              </li>
              <li>
                <Link href="/movies" className="hover:text-purple-400 transition-colors inline-block">
                  All Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Orders Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-gray-200">
              My Account
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/my-bookings" className="hover:text-purple-400 transition-colors inline-block">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-purple-400 transition-colors inline-block">
                  Profile Details
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-purple-400 transition-colors inline-block">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-purple-400 transition-colors inline-block">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-gray-200">
              Support & Legal
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-purple-400 transition-colors inline-block">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-purple-400 transition-colors inline-block">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-purple-400 transition-colors inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-purple-400 transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-purple-400 transition-colors inline-block">
                  About Project
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 mt-14 pt-8 space-y-3 text-xs text-gray-500">
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl px-4 py-2.5 text-center text-gray-400">
            <span className="font-semibold text-purple-300">Notice:</span> Authentic movie posters, synopsis, cast, and metadata are presented for realistic preview. Screenings, seat selection maps, and payment checkouts represent simulated academic demonstration inventory.
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 CineBook — Movie Ticket Booking System. Built with Next.js, React & Tailwind CSS.</p>
            <p className="flex items-center gap-1.5 text-gray-500">
              <span>Academic Software Engineering Project</span>
              <span>•</span>
              <span className="text-purple-400/80 font-medium">Demonstration Mode</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
