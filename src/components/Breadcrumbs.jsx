// src/components/Breadcrumbs.jsx
import React from 'react';
import { useExamGuard } from '../hooks/useExamGuard.jsx';

/**
 * ✅ Component Breadcrumbs - HỖ TRỢ ĐẦY ĐỦ useExamGuard
 * 
 * CÁCH SỬ DỤNG:
 * 1. Truyền onClick (function) → Tự động có cảnh báo nếu đang làm bài
 * 2. Truyền link (string) → Không có cảnh báo (dùng cho trang không có bài thi)
 * 
 * VÍ DỤ:
 * const breadcrumbPaths = [
 *   { name: 'ホーム', onClick: () => navigate('/') }, // ✅ Có cảnh báo
 *   { name: 'JLPT', link: '/jlpt' },                 // ❌ Không cảnh báo
 *   { name: 'N1' }                                    // Trang hiện tại
 * ];
 */
function Breadcrumbs({ paths }) {
  const { navigate: navigateWithWarning } = useExamGuard();

  return (
    <nav className="text-gray-600 mb-6 text-sm" aria-label="breadcrumb">
      <ol className="list-none p-0 inline-flex flex-wrap">
        {paths.map((path, index) => (
          <li key={`${path.name}-${index}`} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">&gt;</span>}

            {index < paths.length - 1 ? (
              // ✅ CÓ onClick hoặc handleNavigate → Dùng navigate có cảnh báo
              path.onClick ? (
                <button
                  onClick={path.onClick}
                  className="text-black hover:text-[#FF5722] bg-transparent border-none cursor-pointer font-black uppercase tracking-wide transition-colors hover:bg-yellow-400 px-2 py-1 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {path.name}
                </button>
              ) : path.handleNavigate ? (
                <button
                  onClick={path.handleNavigate}
                  className="text-black hover:text-[#FF5722] bg-transparent border-none cursor-pointer font-black uppercase tracking-wide transition-colors hover:bg-yellow-400 px-2 py-1 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {path.name}
                </button>
              ) : path.link ? (
                // ✅ CÓ link → Dùng <a> thông thường (không cảnh báo)
                <a
                  href={path.link}
                  className="text-black hover:text-[#FF5722] font-black uppercase tracking-wide transition-colors hover:bg-yellow-400 px-2 py-1 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {path.name}
                </a>
              ) : (
                // ❌ Không có gì → Chỉ hiển thị text
                <span className="text-gray-600">{path.name}</span>
              )
            ) : (
              // Trang hiện tại (mục cuối) → Không clickable
              <span className="text-black font-black uppercase tracking-wide">{path.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;