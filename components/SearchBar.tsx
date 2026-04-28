'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Doc {
  id: number;
  title: string;
  slug: string;
  content: string;
  section: { slug: string; title: string };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Doc[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        const res = await fetch('/api/docs');
        const docs: Doc[] = await res.json();
        const filtered = docs.filter(doc =>
          doc.title.toLowerCase().includes(query.toLowerCase()) ||
          doc.content.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 5));
      } catch (error) {
        console.error('Search failed:', error);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search documentation..."
          className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showResults && results.length > 0 && (
        <div
          className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          {results.map((doc) => (
            <Link
              key={doc.id}
              href={`/docs/${doc.section.slug}/${doc.slug}`}
              onClick={() => {
                setShowResults(false);
                setQuery('');
              }}
              className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-gray-900">{doc.title}</div>
              <div className="text-sm text-gray-500">{doc.section.title}</div>
            </Link>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3 text-gray-500">
          No results found
        </div>
      )}

      {showResults && (results.length > 0 || (query.length >= 2 && results.length === 0)) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
