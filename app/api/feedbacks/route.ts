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
    const feedbacks = await prisma.feedback.findMany({
      include: { doc: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, message, docId } = await request.json();
    
    if (!name || !message || !docId) {
      return NextResponse.json({ error: 'Name, message, and docId are required' }, { status: 400 });
    }

    const sanitizedMessage = DOMPurify.sanitize(message);

    const feedback = await prisma.feedback.create({
      data: { 
        name, 
        phone: phone || null, 
        message: sanitizedMessage, 
        docId: parseInt(docId),
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}
