import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { bookingId, action } = await request.json();
    if (!bookingId || !action) return NextResponse.json({ error: 'bookingId and action required' }, { status: 400 });

    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { payment: true, seats: true } });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (booking.status === 'CONFIRMED') return NextResponse.json({ error: 'Booking already confirmed' }, { status: 409 });
    if (booking.status === 'CANCELLED' || booking.status === 'FAILED') return NextResponse.json({ error: 'Booking is no longer active' }, { status: 400 });

    if (action === 'SUCCESS') {
      const seatIds = booking.seats.map(s => s.seatId);
      const existingBookedSeats = await prisma.bookingSeat.count({ where: { showId: booking.showId, seatId: { in: seatIds }, bookingId: { not: bookingId } } });
      if (existingBookedSeats > 0) {
        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'FAILED' } });
        return NextResponse.json({ error: 'Seat conflict detected. Refund will be initiated.' }, { status: 409 });
      }
      const result = await prisma.$transaction(async (tx) => {
        let payment;
        if (booking.payment) {
          payment = await tx.payment.update({ where: { id: booking.payment.id }, data: { status: 'SUCCESS', provider: 'DEMO', providerReference: `DEMO-${Date.now()}` } });
        } else {
          payment = await tx.payment.create({ data: { bookingId, provider: 'DEMO', providerReference: `DEMO-${Date.now()}`, amount: booking.totalAmount, currency: 'INR', status: 'SUCCESS' } });
        }
        const updatedBooking = await tx.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } });
        return { booking: updatedBooking, payment };
      });
      return NextResponse.json(result);
    } else if (action === 'FAILURE') {
      let payment;
      if (booking.payment) {
        payment = await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'FAILED' } });
      } else {
        payment = await prisma.payment.create({ data: { bookingId, provider: 'DEMO', amount: booking.totalAmount, currency: 'INR', status: 'FAILED' } });
      }
      const updatedBooking = await prisma.booking.update({ where: { id: bookingId }, data: { status: 'FAILED' } });
      await prisma.seatReservation.updateMany({ where: { showId: booking.showId, userId: session.id, status: 'CONFIRMED' }, data: { status: 'RELEASED' } });
      return NextResponse.json({ booking: updatedBooking, payment });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
