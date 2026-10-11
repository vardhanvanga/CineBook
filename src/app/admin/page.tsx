'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Film, Building2, Calendar, Ticket, IndianRupee, ArrowRight, ShieldCheck, Plus, CheckCircle, XCircle } from 'lucide-react';

interface Stats {
  totalMovies: number;
  totalTheatres: number;
  totalShows: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-900 border border-purple-700 text-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin Portal
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Cinema Operations & Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Manage movies, multiplex screens, schedules, and ticket revenue</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/verify-ticket"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Verify Tickets
            </Link>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>Total Revenue</span>
                <IndianRupee className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                ₹{stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <p className="text-[11px] text-gray-500 mt-1">From confirmed bookings</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>Confirmed Bookings</span>
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.confirmedBookings}</span>
              <p className="text-[11px] text-gray-500 mt-1">{stats.totalBookings} total orders placed</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>Active Movies</span>
                <Film className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalMovies}</span>
              <p className="text-[11px] text-gray-500 mt-1">Catalog titles in system</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>Scheduled Shows</span>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalShows}</span>
              <p className="text-[11px] text-gray-500 mt-1">Across {stats.totalTheatres} theatres</p>
            </div>
          </div>
        )}

        {/* Admin Navigation Hub */}
        <h2 className="text-xl font-bold text-white mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/movies"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl p-6 transition-all movie-card flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-purple-900/30 border border-purple-800/40 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-900/50 transition-colors">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Movie Catalog</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Add new titles, update synopsis, duration, posters, and set release status.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Manage Movies</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/theatres"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl p-6 transition-all movie-card flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-purple-900/30 border border-purple-800/40 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-900/50 transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Theatres & Screens</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Configure multiplex cinemas, screen seating layouts, and VIP tiers.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Manage Theatres</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/shows"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl p-6 transition-all movie-card flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-purple-900/30 border border-purple-800/40 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-900/50 transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Show Schedules</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Schedule movie screenings, configure start times, and set tier pricing.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Manage Shows</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/bookings"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-600/50 rounded-2xl p-6 transition-all movie-card flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-purple-900/30 border border-purple-800/40 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-900/50 transition-colors">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Bookings & Orders</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Search booking references, inspect seat allocations, and view payments.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Manage Bookings</span> <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
