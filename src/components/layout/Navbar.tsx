'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, MapPin, Search, User, Menu, X, LogOut, Ticket, Settings, ArrowRight } from 'lucide-react';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d?.user && setUser(d.user));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <nav className="bg-gray-950/95 backdrop-blur-md border-b border-gray-800/80 sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-[72px] gap-3 sm:gap-4">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-gradient-to-tr from-purple-700 to-purple-500 p-2 rounded-xl shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Cine<span className="text-purple-400">Book</span>
              </span>
            </Link>

            {/* Location Selector */}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900/90 hover:bg-gray-850 border border-gray-800 hover:border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-colors shrink-0"
              title="Current City: Hyderabad"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="hidden xs:inline">Hyderabad</span>
            </button>
          </div>

          {/* Flexible Center Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg min-w-0 mx-2 lg:mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, multiplexes, genres..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/90 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-full pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
              />
              {searchQuery.trim() && (
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                  title="Submit Search"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-5 lg:gap-6 shrink-0">
            <Link
              href="/movies"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors shrink-0"
            >
              Movies
            </Link>
            <Link
              href="/theatres"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors shrink-0"
            >
              Theatres
            </Link>

            {user ? (
              <div className="flex items-center gap-3.5 pl-2 border-l border-gray-800 shrink-0">
                <Link
                  href="/my-bookings"
                  className="text-sm font-medium text-purple-300 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>My Bookings</span>
                </Link>

                <div className="relative shrink-0">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-600/40 text-purple-300 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-52 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in divide-y divide-gray-800">
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-4 h-4 text-purple-400" /> Account Profile
                        </Link>
                        <Link
                          href="/my-bookings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Ticket className="w-4 h-4 text-purple-400" /> My Bookings
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-purple-400 hover:text-purple-300 hover:bg-gray-800/80 transition-colors font-semibold"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" /> Admin Operations
                          </Link>
                        )}
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-800 shrink-0">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors px-2.5 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold px-4.5 py-2 rounded-full transition-all shadow-md shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Action Area (Sign In/Profile + Menu Toggle) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            {user ? (
              <Link
                href="/profile"
                className="w-8 h-8 rounded-full bg-purple-600/40 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-500/40"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-800/80 px-2.5 py-1 rounded-full"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu & Search Row */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-800/80 space-y-3.5 animate-fade-in">
            {/* Mobile Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies, multiplexes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </form>

            <div className="space-y-1 pt-1">
              <Link
                href="/movies"
                className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/theatres"
                className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Theatres
              </Link>
            </div>

            {user ? (
              <div className="space-y-1 pt-2.5 border-t border-gray-800">
                <Link
                  href="/my-bookings"
                  className="block text-sm font-medium text-purple-300 hover:text-white hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  href="/profile"
                  className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile Details
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="block text-sm font-medium text-purple-400 hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Operations
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-sm font-medium text-red-400 hover:bg-gray-900 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2 border-t border-gray-800">
                <Link
                  href="/login"
                  className="flex-1 text-center bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-full transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex-1 text-center bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2.5 rounded-full transition-colors shadow-md shadow-purple-600/30"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
