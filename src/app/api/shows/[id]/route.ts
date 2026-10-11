import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const show = await prisma.show.findUnique({
      where: { id },
      include: {
        movie: true,
        screen: { include: { theatre: true, seats: { where: { isActive: true }, orderBy: [{ rowLabel: 'asc' }, { seatNumber: 'asc' }] } } },
      },
    });
    if (!show) return NextResponse.json({ error: 'Show not found' }, { status: 404 });

    const [bookedSeatIds, reservedSeats] = await Promise.all([
      prisma.bookingSeat.findMany({ where: { showId: id }, select: { seatId: true } }),
      prisma.seatReservation.findMany({ where: { showId: id, status: 'PENDING', expiresAt: { gt: new Date() } }, select: { seatId: true, userId: true } }),
    ]);

    const bookedSet = new Set(bookedSeatIds.map(b => b.seatId));
    const reservedMap = new Map(reservedSeats.map(r => [r.seatId, r.userId]));

    const seatsWithStatus = show.screen.seats.map(seat => ({
      ...seat,
      status: bookedSet.has(seat.id) ? 'BOOKED' : reservedMap.has(seat.id) ? 'RESERVED' : 'AVAILABLE',
    }));

    return NextResponse.json({ show: { ...show, screen: { ...show.screen, seats: seatsWithStatus } } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch show' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const show = await prisma.show.update({ where: { id }, data: body });
    return NextResponse.json({ show });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 });
  }
}
