import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboard() {
  const [sectionsCount, docsCount, pendingSuggestionsCount, feedbacksCount] = await Promise.all([
    prisma.section.count(),
    prisma.doc.count(),
    prisma.suggestion.count({ where: { status: 'pending' } }),
    prisma.feedback.count(),
  ]);

  const recentSuggestions = await prisma.suggestion.findMany({
    where: { status: 'pending' },
    include: { doc: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const recentFeedbacks = await prisma.feedback.findMany({
    include: { doc: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const stats = [
    { label: 'Total Sections', value: sectionsCount, color: 'bg-blue-500' },
    { label: 'Total Documents', value: docsCount, color: 'bg-green-500' },
    { label: 'Pending Suggestions', value: pendingSuggestionsCount, color: 'bg-yellow-500' },
    { label: 'Total Feedback', value: feedbacksCount, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4`}></div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Suggestions</h2>
          </div>
          <div className="p-6">
            {recentSuggestions.length === 0 ? (
              <p className="text-gray-500">No pending suggestions</p>
            ) : (
              <ul className="space-y-4">
                {recentSuggestions.map((suggestion: { id: number; name: string; doc: { title: string }; createdAt: Date }) => (
                  <li key={suggestion.id} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {suggestion.name} suggested edits for {suggestion.doc.title}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(suggestion.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
          </div>
          <div className="p-6">
            {recentFeedbacks.length === 0 ? (
              <p className="text-gray-500">No feedback yet</p>
            ) : (
              <ul className="space-y-4">
                {recentFeedbacks.map((feedback: { id: number; name: string; message: string; doc: { title: string }; createdAt: Date }) => (
                  <li key={feedback.id} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {feedback.name} left feedback on {feedback.doc.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-sm">{feedback.message}</p>
                      <p className="text-xs text-gray-400">{formatDate(feedback.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
