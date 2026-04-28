import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        docs: {
          select: { id: true, title: true, slug: true, sectionId: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { docs: true },
        },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, order = 0 } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let slug = slugify(title);
    let counter = 1;
    
    while (await prisma.section.findUnique({ where: { slug } })) {
      slug = `${slugify(title)}-${counter}`;
      counter++;
    }

    const section = await prisma.section.create({
      data: { title, slug, order },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}
