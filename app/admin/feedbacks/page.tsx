'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Feedback {
  id: number;
  name: string;
  phone: string | null;
  message: string;
  doc: { title: string };
  createdAt: string;
}

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/feedbacks');
      const data = await res.json();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  const columns = [
    { key: 'doc', header: 'Document', render: (v: unknown) => (v as { title: string }).title },
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone', render: (v: unknown) => (v as string | null) || '-' },
    { key: 'message', header: 'Message', render: (v: unknown) => {
      const msg = v as string;
      return msg.slice(0, 50) + (msg.length > 50 ? '...' : '');
    } },
    { key: 'createdAt', header: 'Date', render: (v: unknown) => formatDate(v as string) },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Feedback</h1>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={feedbacks as unknown[]}
          actions={(row) => {
            const feedback = row as Feedback;
            return (
              <>
                <button
                  onClick={() => setViewingFeedback(feedback)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </>
            );
          }}
        />
      </div>

      {viewingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Feedback Details</h2>
                <button
                  onClick={() => setViewingFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Document</p>
                  <p className="font-medium">{viewingFeedback.doc.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium">{viewingFeedback.name}</p>
                  {viewingFeedback.phone && <p className="text-sm">{viewingFeedback.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{formatDateTime(viewingFeedback.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Message</p>
                  <p className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {viewingFeedback.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
