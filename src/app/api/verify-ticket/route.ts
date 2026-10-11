import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });
    const booking = await prisma.booking.findFirst({
      where: { OR: [{ verificationToken: token }, { bookingReference: token }] },
      include: {
        user: { select: { name: true, email: true } },
        show: { include: { movie: { select: { title: true } }, screen: { include: { theatre: { select: { name: true } } } } } },
        seats: { include: { seat: { select: { rowLabel: true, seatNumber: true } } } },
      },
    });
    if (!booking) return NextResponse.json({ valid: false, error: 'Ticket not found' });
    return NextResponse.json({
      valid: booking.status === 'CONFIRMED',
      checkedIn: booking.checkedIn,
      booking: {
        reference: booking.bookingReference, status: booking.status,
        customerName: booking.user.name, movie: booking.show.movie.title,
        theatre: booking.show.screen.theatre.name, showTime: booking.show.startTime,
        seats: booking.seats.map(s => `${s.seat.rowLabel}${s.seat.seatNumber}`),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const booking = await prisma.booking.findFirst({ where: { OR: [{ verificationToken: token }, { bookingReference: token }], status: 'CONFIRMED' } });
    if (!booking) return NextResponse.json({ success: false, error: 'Invalid ticket' }, { status: 404 });
    if (booking.checkedIn) return NextResponse.json({ success: false, error: 'Ticket already used' }, { status: 409 });
    await prisma.booking.update({ where: { id: booking.id }, data: { checkedIn: true, checkedInAt: new Date() } });
    return NextResponse.json({ success: true, message: 'Check-in successful' });
  } catch (error) {
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }
}
