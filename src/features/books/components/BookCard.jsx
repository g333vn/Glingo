//chọn sách
import React from 'react';

// Component nhận props là imageUrl và title
function BookCard({ imageUrl, title }) {
  return (
    // Thẻ div bao ngoài cùng của Card
    // bg-white: nền trắng
    // rounded-lg: bo góc lớn
    // shadow-md: bóng đổ vừa
    // overflow-hidden: ẩn phần ảnh thừa (nếu ảnh không đúng tỉ lệ)
    // hover:shadow-lg: tăng bóng đổ khi di chuột
    // transition-shadow duration-200 ease-in-out: hiệu ứng chuyển động mượt
    // cursor-pointer: đổi con trỏ thành bàn tay
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer">
      
      {/* Phần hình ảnh */}
      {/* aspect-w-3 aspect-h-4: Giữ tỉ lệ khung hình 3:4 cho ảnh bìa sách */}
      {/* Nếu class aspect-* không hoạt động, bạn có thể cần cài plugin @tailwindcss/aspect-ratio */}
      {/* Hoặc dùng cách CSS thuần: style={{ paddingBottom: '133.33%' }} trên thẻ div cha và position absolute cho img */}
      <div className="aspect-w-3 aspect-h-4 bg-gray-200"> {/* Thêm bg-gray-200 làm nền chờ */}
        <img 
          src={imageUrl} 
          alt={title} 
          // object-cover: Phóng to ảnh để lấp đầy khung, giữ tỉ lệ (có thể bị cắt ảnh)
          // w-full h-full: Chiếm 100% kích thước thẻ div cha
          className="object-cover w-full h-full" 
          loading="lazy" // Tải ảnh lười (chỉ tải khi gần tới màn hình)
        />
      </div>
      
      {/* Phần tên sách */}
      <div className="p-3 text-center"> {/* padding 3, căn giữa text */}
        <p 
          className="text-sm font-semibold text-gray-700 truncate" // Chữ nhỏ, đậm vừa, màu xám, tự động cắt (...) nếu dài
          title={title} // Hiện đầy đủ tên khi di chuột vào
        > 
          {title}
        </p>
      </div>
    </div>
  );
}

// Cài đặt plugin aspect-ratio (nếu cần):
// 1. Mở Terminal
// 2. npm install -D @tailwindcss/aspect-ratio
// 3. Mở file tailwind.config.js, thêm vào phần plugins:
//    plugins: [
//      require('@tailwindcss/aspect-ratio'),
//    ],

export default BookCard;

