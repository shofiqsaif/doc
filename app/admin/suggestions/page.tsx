'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/admin/DataTable';
import { formatDate, formatDateTime } from '@/lib/utils';

interface Suggestion {
  id: number;
  name: string;
  phone: string | null;
  content: string;
  status: string;
  doc: { title: string };
  createdAt: string;
}

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingSuggestion, setViewingSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to update suggestion:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;

    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to delete suggestion:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'doc', header: 'Document', render: (v: unknown) => (v as { title: string }).title },
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone', render: (v: unknown) => (v as string | null) || '-' },
    { key: 'status', header: 'Status', render: (v: unknown) => getStatusBadge(v as string) },
    { key: 'createdAt', header: 'Date', render: (v: unknown) => formatDate(v as string) },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Suggestions</h1>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={suggestions as unknown[]}
          actions={(row) => {
            const suggestion = row as Suggestion;
            return (
              <>
                <button
                  onClick={() => setViewingSuggestion(suggestion)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  View
                </button>
                {suggestion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(suggestion.id, 'approved')}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(suggestion.id, 'rejected')}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(suggestion.id)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Delete
                </button>
              </>
            );
          }}
        />
      </div>

      {viewingSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Suggestion Details</h2>
                <button
                  onClick={() => setViewingSuggestion(null)}
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
                  <p className="font-medium">{viewingSuggestion.doc.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="font-medium">{viewingSuggestion.name}</p>
                  {viewingSuggestion.phone && <p className="text-sm">{viewingSuggestion.phone}</p>}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{formatDateTime(viewingSuggestion.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Content</p>
                  <div 
                    className="p-4 bg-gray-50 rounded-md prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: viewingSuggestion.content }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
