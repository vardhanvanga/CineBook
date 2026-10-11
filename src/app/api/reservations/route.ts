import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

const TIMEOUT = parseInt(process.env.RESERVATION_TIMEOUT_MINUTES || '5');
const MAX_SEATS = parseInt(process.env.MAX_SEATS_PER_BOOKING || '6');

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { showId, seatIds } = await request.json();
    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    if (seatIds.length > MAX_SEATS) return NextResponse.json({ error: `Maximum ${MAX_SEATS} seats per booking` }, { status: 400 });

    const show = await prisma.show.findUnique({ where: { id: showId }, select: { id: true, status: true, startTime: true, screenId: true } });
    if (!show || show.status !== 'ACTIVE') return NextResponse.json({ error: 'Show not available' }, { status: 400 });
    if (show.startTime <= new Date()) return NextResponse.json({ error: 'Show has already started' }, { status: 400 });

    const seats = await prisma.seat.findMany({ where: { id: { in: seatIds }, screenId: show.screenId, isActive: true } });
    if (seats.length !== seatIds.length) return NextResponse.json({ error: 'One or more seats are invalid' }, { status: 400 });

    const expiresAt = new Date(Date.now() + TIMEOUT * 60 * 1000);

    const reservations = await prisma.$transaction(async (tx) => {
      const existingBookings = await tx.bookingSeat.findMany({ where: { showId, seatId: { in: seatIds } } });
      if (existingBookings.length > 0) throw new Error('CONFLICT: One or more seats are already booked');

      const existingReservations = await tx.seatReservation.findMany({
        where: { showId, seatId: { in: seatIds }, status: 'PENDING', expiresAt: { gt: new Date() } },
      });
      if (existingReservations.length > 0) throw new Error('CONFLICT: One or more seats are temporarily reserved');

      await tx.seatReservation.updateMany({ where: { showId, seatId: { in: seatIds }, status: 'PENDING', expiresAt: { lte: new Date() } }, data: { status: 'EXPIRED' } });
      await tx.seatReservation.updateMany({ where: { showId, userId: session.id, status: 'PENDING' }, data: { status: 'RELEASED' } });

      return Promise.all(seatIds.map((seatId: string) => tx.seatReservation.create({ data: { showId, seatId, userId: session.id, status: 'PENDING', expiresAt } })));
    });

    return NextResponse.json({ reservations, expiresAt, timeoutMinutes: TIMEOUT }, { status: 201 });
  } catch (error: any) {
    if (error.message?.startsWith('CONFLICT')) return NextResponse.json({ error: error.message.replace('CONFLICT: ', '') }, { status: 409 });
    console.error('Reservation error:', error);
    return NextResponse.json({ error: 'Failed to reserve seats' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const showId = new URL(request.url).searchParams.get('showId');
    if (!showId) return NextResponse.json({ error: 'showId required' }, { status: 400 });
    await prisma.seatReservation.updateMany({ where: { showId, userId: session.id, status: 'PENDING' }, data: { status: 'RELEASED' } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to release reservation' }, { status: 500 });
  }
}
