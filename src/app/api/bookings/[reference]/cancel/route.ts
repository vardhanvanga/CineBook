import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { reference } = await params;
    const booking = await prisma.booking.findUnique({
      where: { bookingReference: reference },
      include: { show: true, payment: true, cancellation: true },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.id && session.role !== 'ADMIN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    if (booking.status !== 'CONFIRMED') return NextResponse.json({ error: 'Only confirmed bookings can be cancelled' }, { status: 400 });
    if (booking.cancellation) return NextResponse.json({ error: 'Booking already cancelled' }, { status: 409 });
    const hoursBeforeShow = (booking.show.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursBeforeShow < 2) return NextResponse.json({ error: 'Cancellation not allowed within 2 hours of show start' }, { status: 400 });
    const refundAmount = booking.totalAmount * 0.75;
    const result = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
      const cancellation = await tx.cancellation.create({ data: { bookingId: booking.id, paymentId: booking.payment?.id, reason: 'Customer cancellation', refundAmount, status: 'APPROVED' } });
      if (booking.payment) await tx.payment.update({ where: { id: booking.payment.id }, data: { status: 'REFUNDED' } });
      await tx.bookingSeat.deleteMany({ where: { bookingId: booking.id } });
      return { booking: updatedBooking, cancellation };
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
