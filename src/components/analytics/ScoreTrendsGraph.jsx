// src/components/analytics/ScoreTrendsGraph.jsx
// 📊 Score Trends Graph - Display quiz score history with chart

import React from 'react';
import { getLessonQuizScores } from '../../utils/lessonProgressTracker.js';

function ScoreTrendsGraph({ bookId, chapterId, lessonId, lessonTitle = 'Quiz' }) {
  const scores = getLessonQuizScores(bookId, chapterId, lessonId);
  
  if (scores.length === 0) {
    return (
      <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
        <h3 className="text-xl font-black text-gray-800 mb-4">📊 LỊCH SỬ LÀM BÀI</h3>
        <p className="text-gray-600 text-center py-8">Chưa có lịch sử làm bài. Hãy thử làm quiz!</p>
      </div>
    );
  }
  
  // Calculate trend
  const firstScore = scores[0].percentage;
  const lastScore = scores[scores.length - 1].percentage;
  const trend = lastScore - firstScore;
  const avgScore = Math.round(scores.reduce((acc, s) => acc + s.percentage, 0) / scores.length);
  const maxScore = Math.max(...scores.map(s => s.percentage));
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
      <h3 className="text-xl font-black text-gray-800 mb-4">📊 LỊCH SỬ LÀM BÀI</h3>
      <p className="text-sm text-gray-600 mb-4">{lessonTitle}</p>
      
      {/* Bar Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between gap-2 h-48 border-b-[3px] border-l-[3px] border-black p-4">
          {scores.map((scoreData, index) => {
            const height = (scoreData.percentage / 100) * 100;
            const color = scoreData.percentage >= 90 ? 'bg-green-500' :
                         scoreData.percentage >= 70 ? 'bg-blue-500' :
                         scoreData.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                {/* Bar */}
                <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <div 
                    className={`w-full ${color} rounded-t-lg border-[2px] border-black transition-all duration-300 hover:opacity-80 group relative`}
                    style={{ height: `${height}%`, minHeight: '20px' }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {scoreData.percentage}%
                        <div className="text-[10px] text-gray-300">
                          {scoreData.score}/{scoreData.total}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Label */}
                <span className="text-[10px] font-bold text-gray-600 mt-1">
                  #{index + 1}
                </span>
                <span className="text-[10px] font-bold text-gray-800">
                  {scoreData.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg border-[3px] border-black p-3 text-center">
          <div className="text-2xl font-black text-blue-600">{avgScore}%</div>
          <div className="text-xs font-bold text-gray-600 uppercase">Trung bình</div>
        </div>
        
        <div className="bg-green-50 rounded-lg border-[3px] border-black p-3 text-center">
          <div className="text-2xl font-black text-green-600">{maxScore}%</div>
          <div className="text-xs font-bold text-gray-600 uppercase">Cao nhất</div>
        </div>
        
        <div className={`${trend >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg border-[3px] border-black p-3 text-center`}>
          <div className={`text-2xl font-black ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
          <div className="text-xs font-bold text-gray-600 uppercase">Xu hướng</div>
        </div>
      </div>
      
      {/* Trend Message */}
      <div className={`p-3 rounded-lg border-[3px] border-black ${
        trend > 20 ? 'bg-green-100' :
        trend > 0 ? 'bg-blue-100' :
        trend === 0 ? 'bg-gray-100' : 'bg-yellow-100'
      }`}>
        <p className="text-sm font-bold text-gray-800">
          📈 {trend > 20 ? 'Tiến bộ vượt bậc! Bạn đang học rất tốt! 🎉' :
              trend > 0 ? 'Có tiến bộ! Tiếp tục phát huy nhé! 💪' :
              trend === 0 ? 'Điểm ổn định. Hãy cố gắng thêm để cải thiện! 📚' :
              'Hãy ôn lại kiến thức và thử lại nhé! 🔥'}
        </p>
      </div>
      
      {/* Detailed History */}
      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-gray-800 hover:text-blue-600 transition-colors">
          📋 Chi tiết các lần làm bài ({scores.length} lần)
        </summary>
        
        <div className="mt-3 space-y-2">
          {scores.map((scoreData, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border-[2px] border-gray-300"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-600">#{index + 1}</span>
                <span className="text-sm text-gray-600">
                  {new Date(scoreData.timestamp).toLocaleDateString('vi-VN')} {new Date(scoreData.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`font-bold ${
                  scoreData.percentage >= 90 ? 'text-green-600' :
                  scoreData.percentage >= 70 ? 'text-blue-600' :
                  scoreData.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {scoreData.percentage}%
                </span>
                <span className="text-xs text-gray-500">
                  ({scoreData.score}/{scoreData.total})
                </span>
                
                {/* Trend indicator compared to previous */}
                {index > 0 && (
                  <span className="text-xs">
                    {scoreData.percentage > scores[index - 1].percentage ? '📈' :
                     scoreData.percentage < scores[index - 1].percentage ? '📉' : '➡️'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

export default ScoreTrendsGraph;

