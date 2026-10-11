import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const search = searchParams.get('search');

    const where: any = {};
    if (status) where.status = status;
    if (genre) where.genre = { contains: genre };
    if (language) where.language = { contains: language };
    if (search) where.title = { contains: search };

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
    });

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Movies fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const movie = await prisma.movie.create({ data: body });
    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
