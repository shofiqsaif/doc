import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const filepath = join(UPLOAD_DIR, filename);

    if (!existsSync(filepath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = await readFile(filepath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Failed to serve file', { status: 500 });
  }
}
