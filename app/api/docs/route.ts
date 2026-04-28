import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    const docs = await prisma.doc.findMany({
      where: sectionId ? { sectionId: parseInt(sectionId) } : undefined,
      include: { section: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(docs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch docs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content, sectionId, order = 0 } = await request.json();
    
    if (!title || !sectionId) {
      return NextResponse.json({ error: 'Title and sectionId are required' }, { status: 400 });
    }

    let slug = slugify(title);
    let counter = 1;
    
    while (await prisma.doc.findUnique({ where: { slug } })) {
      slug = `${slugify(title)}-${counter}`;
      counter++;
    }

    const sanitizedContent = DOMPurify.sanitize(content || '', {
      ADD_TAGS: ['iframe', 'video'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'controls'],
    });

    const doc = await prisma.doc.create({
      data: { 
        title, 
        slug, 
        content: sanitizedContent, 
        sectionId: parseInt(sectionId), 
        order 
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create doc' }, { status: 500 });
  }
}
