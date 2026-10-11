import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const theatre = await prisma.theatre.findUnique({
      where: { id },
      include: { screens: { include: { seats: { select: { id: true, rowLabel: true, seatNumber: true, category: true, isActive: true } } } } },
    });
    if (!theatre) return NextResponse.json({ error: 'Theatre not found' }, { status: 404 });
    return NextResponse.json({ theatre });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch theatre' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const theatre = await prisma.theatre.update({ where: { id }, data: body });
    return NextResponse.json({ theatre });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update theatre' }, { status: 500 });
  }
}
