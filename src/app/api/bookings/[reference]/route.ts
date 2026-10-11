import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const { reference } = await params;
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ bookingReference: reference }, { id: reference }],
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        show: { include: { movie: true, screen: { include: { theatre: true } } } },
        seats: { include: { seat: { select: { rowLabel: true, seatNumber: true, category: true } } } },
        payment: true, cancellation: true,
      },
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.id && session.role !== 'ADMIN') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    return NextResponse.json({ booking });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
