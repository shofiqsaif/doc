import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

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
    const { title, order } = await request.json();
    
    const existingSection = await prisma.section.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    let slug = existingSection.slug;
    if (title && title !== existingSection.title) {
      slug = slugify(title);
      let counter = 1;
      
      while (await prisma.section.findFirst({ 
        where: { slug, id: { not: parseInt(id) } } 
      })) {
        slug = `${slugify(title)}-${counter}`;
        counter++;
      }
    }

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: { title: title || existingSection.title, slug, order: order ?? existingSection.order },
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
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
    
    await prisma.section.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
