'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TipTapEditor from '@/components/TipTapEditor';

interface Section {
  id: number;
  title: string;
}

interface Doc {
  id: number;
  title: string;
  content: string;
  sectionId: number;
  order: number;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditDoc({ params }: Props) {
  const router = useRouter();
  const [docId, setDocId] = useState<string>('');
  const [sections, setSections] = useState<Section[]>([]);
  const [doc, setDoc] = useState<Doc | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => {
      setDocId(p.id);
      fetchData(p.id);
    });
  }, [params]);

  const fetchData = async (id: string) => {
    try {
      const [sectionsRes, docRes] = await Promise.all([
        fetch('/api/sections'),
        fetch(`/api/docs/${id}`),
      ]);

      const sectionsData = await sectionsRes.json();
      const docData = await docRes.json();

      setSections(sectionsData);
      setDoc(docData);
      setTitle(docData.title);
      setContent(docData.content);
      setSectionId(String(docData.sectionId));
      setOrder(docData.order);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docId) return;
    
    setSaving(true);

    try {
      const res = await fetch(`/api/docs/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, sectionId, order }),
      });

      if (res.ok) {
        router.push('/admin/docs');
        router.refresh();
      } else {
        alert('Failed to update document');
      }
    } catch (error) {
      console.error('Failed to update doc:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!doc) {
    return <div className="p-8">Document not found</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Document</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <select
              required
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a section</option>
              {sections.map((section: Section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/docs')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title || !sectionId}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Document'}
          </button>
        </div>
      </form>
    </div>
  );
}
