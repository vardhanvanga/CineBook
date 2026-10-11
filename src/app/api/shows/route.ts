import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get('movieId');
    const theatreId = searchParams.get('theatreId');
    const date = searchParams.get('date');

    const where: any = { status: 'ACTIVE', startTime: { gte: new Date() } };
    if (movieId) where.movieId = movieId;
    if (theatreId) where.screen = { theatreId };
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      where.startTime = { gte: start, lte: end };
    }

    const shows = await prisma.show.findMany({
      where,
      include: {
        movie: { select: { id: true, title: true, durationMinutes: true, certification: true, posterUrl: true } },
        screen: { include: { theatre: { select: { id: true, name: true, address: true, city: true, area: true, amenities: true } } } },
        _count: { select: { bookingSeats: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    const showsWithAvailability = await Promise.all(shows.map(async (show) => {
      const screen = await prisma.screen.findUnique({ where: { id: show.screenId }, select: { totalSeats: true } });
      const reservedSeats = await prisma.seatReservation.count({ where: { showId: show.id, status: 'PENDING', expiresAt: { gt: new Date() } } });
      return { ...show, totalSeats: screen?.totalSeats || 0, bookedSeats: show._count.bookingSeats, reservedSeats, availableSeats: (screen?.totalSeats || 0) - show._count.bookingSeats - reservedSeats };
    }));

    return NextResponse.json({ shows: showsWithAvailability });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const movie = await prisma.movie.findUnique({ where: { id: body.movieId }, select: { durationMinutes: true } });
    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    const startTime = new Date(body.startTime);
    const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60 * 1000);
    const show = await prisma.show.create({
      data: { movieId: body.movieId, screenId: body.screenId, startTime, endTime, status: body.status || 'ACTIVE', regularPrice: body.regularPrice, premiumPrice: body.premiumPrice, reclinerPrice: body.reclinerPrice, convenienceFee: body.convenienceFee || 30, taxRate: body.taxRate || 0.18 },
    });
    return NextResponse.json({ show }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 });
  }
}
