// src/components/analytics/StudyInsights.jsx
// Study Insights Component - Display study analytics

import React from 'react';
import { getWeakLessons, getRecentStudyActivity } from '../../utils/lessonProgressTracker.js';
import { Link } from 'react-router-dom';

function StudyInsights({ bookId, levelId, allLessons = [] }) {
  const weakLessons = getWeakLessons(bookId, allLessons, 70);
  const recentActivity = getRecentStudyActivity(7);
  
  return (
    <div className="space-y-4">
      {/* Study Activity Chart */}
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
        <h3 className="text-xl font-black text-gray-800 mb-4">📊 HOẠT ĐỘNG HỌC TẬP (7 ngày gần đây)</h3>
        
        <div className="space-y-2">
          {recentActivity.map((day, index) => {
            const maxLessons = Math.max(...recentActivity.map(d => d.lessonsCompleted), 1);
            const percentage = (day.lessonsCompleted / maxLessons) * 100;
            
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 w-16">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden border-[2px] border-black">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-300 flex items-center justify-center"
                    style={{ width: `${percentage}%` }}
                  >
                    {day.lessonsCompleted > 0 && (
                      <span className="text-xs font-black text-white">{day.lessonsCompleted}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Weak Lessons */}
      {weakLessons.length > 0 && (
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h3 className="text-xl font-black text-gray-800 mb-4">💡 BÀI HỌC YẾU</h3>
          <p className="text-sm text-gray-600 mb-4">Những bài cần ôn lại (điểm trung bình &lt; 70%)</p>
          
          <div className="space-y-3">
            {weakLessons.slice(0, 5).map((lesson, index) => (
              <Link
                key={index}
                to={`/level/${levelId}/${bookId}/chapter/${lesson.chapterId}/lesson/${lesson.lessonId}`}
                className="block bg-red-50 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">📝 {lesson.title}</h4>
                    <p className="text-xs text-gray-600">
                      Điểm trung bình: <span className="font-bold text-red-600">{lesson.averageScore}%</span>
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md border-[2px] border-black font-black hover:bg-blue-600 transition-colors text-xs">
                    Ôn lại
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Learning Recommendations */}
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
        <h3 className="text-xl font-black text-gray-800 mb-4">🎯 GỢI Ý HỌC TIẾP</h3>
        
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-[2px] border-black">
            <span className="text-xl">➡️</span>
            <div>
              <p className="font-bold text-gray-800">Tiếp tục học</p>
              <p className="text-sm text-gray-600">Hoàn thành các bài học còn lại</p>
            </div>
          </div>
          
          {weakLessons.length > 0 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border-[2px] border-black">
              <span className="text-xl">♻️</span>
              <div>
                <p className="font-bold text-gray-800">Ôn tập</p>
                <p className="text-sm text-gray-600">Có {weakLessons.length} bài học cần ôn lại</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border-[2px] border-black">
            <span className="text-xl">⭐</span>
            <div>
              <p className="font-bold text-gray-800">Thử thách</p>
              <p className="text-sm text-gray-600">Làm quiz tổng hợp để kiểm tra kiến thức</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudyInsights;

