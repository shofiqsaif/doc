import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.doc.findUnique({
      where: { id: parseInt(id) },
      include: { section: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doc' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title, content, sectionId, order } = await request.json();
    
    const existingDoc = await prisma.doc.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDoc) {
      return NextResponse.json({ error: 'Doc not found' }, { status: 404 });
    }

    let slug = existingDoc.slug;
    if (title && title !== existingDoc.title) {
      slug = slugify(title);
      let counter = 1;
      
      while (await prisma.doc.findFirst({ 
        where: { slug, id: { not: parseInt(id) } } 
      })) {
        slug = `${slugify(title)}-${counter}`;
        counter++;
      }
    }

    const sanitizedContent = content ? DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe', 'video', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'sub', 'sup', 'hr', 'blockquote', 'strike'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'controls', 'colspan', 'rowspan', 'style', 'color', 'background-color'],
    }) : existingDoc.content;

    const doc = await prisma.doc.update({
      where: { id: parseInt(id) },
      data: { 
        title: title || existingDoc.title, 
        slug, 
        content: sanitizedContent,
        sectionId: sectionId ? parseInt(sectionId) : existingDoc.sectionId,
        order: order ?? existingDoc.order,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update doc' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    await prisma.doc.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete doc' }, { status: 500 });
  }
}
