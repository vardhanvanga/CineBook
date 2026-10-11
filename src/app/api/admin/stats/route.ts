import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const [totalMovies, totalTheatres, totalShows, totalBookings, confirmedBookings, cancelledBookings, revenue] = await Promise.all([
      prisma.movie.count(), prisma.theatre.count(), prisma.show.count(), prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    ]);
    return NextResponse.json({ stats: { totalMovies, totalTheatres, totalShows, totalBookings, confirmedBookings, cancelledBookings, revenue: revenue._sum.amount || 0 } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
