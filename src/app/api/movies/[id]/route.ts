import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        shows: {
          where: { status: 'ACTIVE', startTime: { gte: new Date() } },
          include: { screen: { include: { theatre: true } } },
          orderBy: { startTime: 'asc' },
        },
      },
    });
    if (!movie) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    return NextResponse.json({ movie });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const movie = await prisma.movie.update({ where: { id }, data: body });
    return NextResponse.json({ movie });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = await params;
    const bookings = await prisma.booking.count({ where: { show: { movieId: id }, status: { in: ['PENDING', 'CONFIRMED'] } } });
    if (bookings > 0) return NextResponse.json({ error: 'Cannot delete movie with active bookings' }, { status: 400 });
    await prisma.movie.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
