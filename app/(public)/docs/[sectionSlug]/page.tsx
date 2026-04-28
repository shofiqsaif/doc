import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ sectionSlug: string }>;
}

export default async function SectionPage({ params }: Props) {
  const { sectionSlug } = await params;
  
  const section = await prisma.section.findUnique({
    where: { slug: sectionSlug },
    include: {
      docs: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!section) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <main className="flex-1">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4">
          <SearchBar />
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {section.title}
            </h1>
          </div>

          <div className="space-y-4">
            {section.docs.map((doc: { id: number; title: string; slug: string }) => (
              <Link
                key={doc.id}
                href={`/docs/${section.slug}/${doc.slug}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900">
                  {doc.title}
                </h2>
              </Link>
            ))}
          </div>

          {section.docs.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No documents in this section yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
