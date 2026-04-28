import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { status } = await request.json();
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const suggestion = await prisma.suggestion.findUnique({
      where: { id: parseInt(id) },
    });

    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    const updatedSuggestion = await prisma.$transaction(async (tx) => {
      const updated = await tx.suggestion.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      if (status === 'approved') {
        await tx.doc.update({
          where: { id: suggestion.docId },
          data: { content: suggestion.content },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
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
    
    await prisma.suggestion.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete suggestion' }, { status: 500 });
  }
}
