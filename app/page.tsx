import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const sections = await prisma.section.findMany({
    include: {
      _count: { select: { docs: true } },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <main className="flex-1">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4">
          <SearchBar />
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Documentation
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to our documentation site. Find guides, tutorials, and API references to help you build amazing things.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section: { id: number; title: string; slug: string; _count: { docs: number } }) => (
              <Link
                key={section.id}
                href={`/docs/${section.slug}`}
                className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-600">
                  {section._count.docs} {section._count.docs === 1 ? 'document' : 'documents'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
