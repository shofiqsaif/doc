'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Section {
  id: number;
  title: string;
  slug: string;
  _count: { docs: number };
  docs: Doc[];
}

interface Doc {
  id: number;
  title: string;
  slug: string;
  sectionId: number;
  section: { slug: string };
}

export default function Sidebar() {
  const [sections, setSections] = useState<Section[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const toggleExpand = (slug: string) => {
    setExpanded(prev => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen w-64 
        bg-gray-50 border-r border-gray-200 overflow-y-auto
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div>
            <span className="font-semibold text-lg">Docs</span>
          </Link>

          <nav className="space-y-1">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleExpand(section.slug)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                >
                  <span>{section.title}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${expanded[section.slug] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expanded[section.slug] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.docs?.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/docs/${section.slug}/${doc.slug}`}
                        className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
                      >
                        {doc.title}
                      </Link>
                    )) || (
                      <div className="px-3 py-2 text-sm text-gray-400">No documents</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
