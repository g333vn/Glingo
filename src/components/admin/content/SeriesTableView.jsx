// src/components/admin/content/SeriesTableView.jsx
// Component hiển thị Series dạng table

import React from 'react';

function SeriesTableView({
  series,
  booksBySeries,
  chaptersData,
  lessonsData,
  quizzesData,
  onEdit,
  onDelete
}) {
  const getSeriesStatus = (seriesItem) => {
    const seriesBooks = booksBySeries[seriesItem.id] || [];
    if (seriesBooks.length === 0) return 'empty';
    return 'published'; // TODO: Implement actual status
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Series</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Books</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lessons</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quizzes</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {series.map(seriesItem => {
            const seriesBooks = booksBySeries[seriesItem.id] || [];
            const status = getSeriesStatus(seriesItem);
            let lessonsCount = 0;
            let quizzesCount = 0;
            seriesBooks.forEach(book => {
              const chapters = chaptersData[book.id] || [];
              chapters.forEach(chapter => {
                const lessons = lessonsData[`${book.id}_${chapter.id}`] || [];
                lessonsCount += lessons.length;
                lessons.forEach(lesson => {
                  if (quizzesData[`${book.id}_${chapter.id}_${lesson.id}`]) quizzesCount++;
                });
              });
            });

            return (
              <tr key={seriesItem.id} className="hover:bg-gray-50">
                <td className="px-3 py-3">
                  <div className="font-semibold text-gray-800">📦 {seriesItem.name}</div>
                  <div className="text-xs text-gray-600">{seriesItem.description || 'No description'}</div>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    status === 'published' ? 'bg-green-100 text-green-800' :
                    status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status === 'published' ? '🟢 Published' : status === 'draft' ? '🟡 Draft' : '🔴 Empty'}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm">{seriesBooks.length}</td>
                <td className="px-3 py-3 text-sm">{lessonsCount}</td>
                <td className="px-3 py-3 text-sm">{quizzesCount}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEdit(seriesItem)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(seriesItem.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SeriesTableView;

