'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';

interface Doc {
  id: number;
  title: string;
  slug: string;
  order: number;
  section: { title: string };
  createdAt: string;
}

interface Section {
  id: number;
  title: string;
}

export default function AdminDocs() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    fetchSections();
    fetchDocs();
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections');
      const data = await res.json();
      setSections(data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    }
  };

  const fetchDocs = async () => {
    try {
      const url = selectedSection 
        ? `/api/docs?sectionId=${selectedSection}` 
        : '/api/docs';
      const res = await fetch(url);
      const data = await res.json();
      setDocs(data);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/docs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDocs();
      }
    } catch (error) {
      console.error('Failed to delete doc:', error);
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'section', header: 'Section', render: (v: unknown) => (v as { title: string }).title },
    { key: 'order', header: 'Order' },
    { key: 'createdAt', header: 'Created', render: (v: unknown) => formatDate(v as string) },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Link
          href="/admin/docs/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create Document
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sections</option>
          {sections.map((section: Section) => (
            <option key={section.id} value={section.id}>
              {section.title}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={docs as unknown[]}
          actions={(row) => {
            const doc = row as Doc;
            return (
              <>
                <Link
                  href={`/admin/docs/${doc.id}/edit`}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 inline-block"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
