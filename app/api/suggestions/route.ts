import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const suggestions = await prisma.suggestion.findMany({
      include: { doc: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, content, docId } = await request.json();
    
    if (!name || !content || !docId) {
      return NextResponse.json({ error: 'Name, content, and docId are required' }, { status: 400 });
    }

    const sanitizedContent = DOMPurify.sanitize(content);

    const suggestion = await prisma.suggestion.create({
      data: { 
        name, 
        phone: phone || null, 
        content: sanitizedContent, 
        docId: parseInt(docId),
        status: 'pending',
      },
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
  }
}
