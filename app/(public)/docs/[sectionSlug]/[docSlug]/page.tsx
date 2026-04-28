import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SuggestionModal from '@/components/SuggestionModal';
import FeedbackModal from '@/components/FeedbackModal';

interface Props {
  params: Promise<{ sectionSlug: string; docSlug: string }>;
}

export default async function DocPage({ params }: Props) {
  const { sectionSlug, docSlug } = await params;
  
  const doc = await prisma.doc.findFirst({
    where: { 
      slug: docSlug,
      section: { slug: sectionSlug }
    },
    include: { section: true },
  });

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      
      <main className="flex-1">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <SearchBar />
          <div className="flex gap-2 ml-4">
            <SuggestionModal docId={doc.id} docTitle={doc.title} />
            <FeedbackModal docId={doc.id} docTitle={doc.title} />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span>/</span>
              <Link href={`/docs/${doc.section.slug}`} className="hover:text-gray-700">
                {doc.section.title}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{doc.title}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {doc.title}
            </h1>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
      </main>
    </div>
  );
}
