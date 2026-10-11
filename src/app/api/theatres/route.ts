import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const theatres = await prisma.theatre.findMany({
      where: { status: 'ACTIVE', ...(city ? { city: { contains: city } } : {}) },
      include: { screens: { include: { _count: { select: { seats: true } } } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ theatres });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch theatres' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const body = await request.json();
    const theatre = await prisma.theatre.create({ data: body });
    return NextResponse.json({ theatre }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create theatre' }, { status: 500 });
  }
}
