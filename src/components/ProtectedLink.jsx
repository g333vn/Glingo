// src/components/ProtectedLink.jsx
import React from 'react';
import { useExamGuard } from '../hooks/useExamGuard.jsx';

/**
 * Component Link có bảo vệ - thay thế <Link> từ react-router-dom
 * Tự động kiểm tra và cảnh báo nếu có bài thi đang làm dở
 */
function ProtectedLink({ to, children, className, onClick, ...props }) {
  const { navigate } = useExamGuard();

  const handleClick = (e) => {
    e.preventDefault(); // Ngăn navigation mặc định
    
    // Gọi onClick tùy chỉnh nếu có
    if (onClick) {
      onClick(e);
    }
    
    // Navigate với cảnh báo
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

export default ProtectedLink;