import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: showId } = await params;
    const show = await prisma.show.findUnique({ where: { id: showId }, select: { id: true, screenId: true } });
    if (!show) return NextResponse.json({ error: 'Show not found' }, { status: 404 });

    const [seats, bookedSeatIds, reservedSeats] = await Promise.all([
      prisma.seat.findMany({ where: { screenId: show.screenId, isActive: true }, orderBy: [{ rowLabel: 'asc' }, { seatNumber: 'asc' }] }),
      prisma.bookingSeat.findMany({ where: { showId }, select: { seatId: true } }),
      prisma.seatReservation.findMany({ where: { showId, status: 'PENDING', expiresAt: { gt: new Date() } }, select: { seatId: true } }),
    ]);

    const bookedSet = new Set(bookedSeatIds.map(b => b.seatId));
    const reservedSet = new Set(reservedSeats.map(r => r.seatId));
    const seatsWithStatus = seats.map(seat => ({ ...seat, status: bookedSet.has(seat.id) ? 'BOOKED' : reservedSet.has(seat.id) ? 'RESERVED' : 'AVAILABLE' }));

    return NextResponse.json({ seats: seatsWithStatus });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 });
  }
}
