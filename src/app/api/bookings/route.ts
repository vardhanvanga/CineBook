import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const where = session.role === 'ADMIN' ? {} : { userId: session.id };
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        show: { include: { movie: { select: { id: true, title: true, posterUrl: true, genre: true } }, screen: { include: { theatre: { select: { id: true, name: true, address: true, city: true } } } } } },
        seats: { include: { seat: { select: { rowLabel: true, seatNumber: true, category: true } } } },
        payment: true, cancellation: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ bookings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { showId, seatIds } = await request.json();
    if (!showId || !Array.isArray(seatIds)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const booking = await prisma.$transaction(async (tx) => {
      const show = await tx.show.findUnique({
        where: { id: showId },
        select: { id: true, status: true, startTime: true, screenId: true, regularPrice: true, premiumPrice: true, reclinerPrice: true, convenienceFee: true, taxRate: true },
      });
      if (!show || show.status !== 'ACTIVE') throw new Error('INVALID: Show not available');
      if (show.startTime <= new Date()) throw new Error('INVALID: Show has already started');

      const reservations = await tx.seatReservation.findMany({
        where: { showId, seatId: { in: seatIds }, userId: session.id, status: 'PENDING', expiresAt: { gt: new Date() } },
        include: { seat: true },
      });
      if (reservations.length !== seatIds.length) throw new Error('EXPIRED: Your seat reservation has expired. Please select seats again.');

      const existingBooked = await tx.bookingSeat.findMany({ where: { showId, seatId: { in: seatIds } } });
      if (existingBooked.length > 0) throw new Error('CONFLICT: Some seats have already been booked');

      let subtotal = 0;
      const seatPrices = reservations.map(r => {
        let price = show.regularPrice;
        if (r.seat.category === 'PREMIUM') price = show.premiumPrice;
        if (r.seat.category === 'RECLINER') price = show.reclinerPrice;
        subtotal += price;
        return { seatId: r.seatId, price, category: r.seat.category };
      });

      const convenienceFee = show.convenienceFee;
      const tax = subtotal * show.taxRate;
      const totalAmount = subtotal + convenienceFee + tax;

      const newBooking = await tx.booking.create({
        data: {
          userId: session.id, showId, status: 'PENDING', subtotal, convenienceFee, tax, totalAmount,
          seats: { create: seatPrices.map(sp => ({ showId, seatId: sp.seatId, priceAtBooking: sp.price, category: sp.category })) },
        },
      });

      await tx.seatReservation.updateMany({ where: { showId, seatId: { in: seatIds }, userId: session.id, status: 'PENDING' }, data: { status: 'CONFIRMED' } });
      return newBooking;
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    if (error.message?.startsWith('EXPIRED') || error.message?.startsWith('CONFLICT') || error.message?.startsWith('INVALID')) {
      return NextResponse.json({ error: error.message.split(': ').slice(1).join(': ') }, { status: 409 });
    }
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
