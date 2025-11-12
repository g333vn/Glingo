import React, { useState, useEffect } from 'react';
// Import icons từ các bộ khác nhau để có logo đẹp hơn
import { FaApple } from 'react-icons/fa'; 
import { FcGoogle } from "react-icons/fc"; // Google icon từ Flat Color Icons
import { SiFacebook, SiLine } from "react-icons/si"; // Facebook & LINE icons từ Simple Icons

function LoginModal({ onClose }) { 
  const [isRegisterView, setIsRegisterView] = useState(true);
  
  // ✅ Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []); 

  const handleBackdropClick = (event) => {
    if (event.target.id === 'modal-backdrop') {
      onClose(); 
    }
  };

  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
  };

  return (
    <div 
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 modal-overlay-enter" // Tăng độ mờ nền
    >
      {/* --- Hộp thoại Modal --- */}
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-sm relative modal-content-enter"> {/* Giảm max-w một chút */}
        
        {/* Nút Đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" // Điều chỉnh vị trí/kích thước
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* --- Phần Form (Render có điều kiện) --- */}
        {isRegisterView ? (
          /* ===== FORM ĐĂNG KÝ (Register) ===== */
          <>
            <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Create your Free Account</h2>
            <form>
              {/* FULL NAME Input */}
              <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="full-name"> {/* Hiển thị Label */}
                   Full Name
                 </label>
                <input 
                  className="appearance-none border border-gray-300 bg-gray-100 rounded w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-yellow-400" // Style input
                  id="full-name" 
                  type="text" 
                  placeholder="Enter your full name here" 
                  required 
                />
              </div>
              {/* Email Input */}
              <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="register-email"> {/* Hiển thị Label */}
                  Email
                 </label>
                <input 
                  className="appearance-none border border-gray-300 bg-gray-100 rounded w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-yellow-400" // Style input
                  id="register-email" 
                  type="email" 
                  placeholder="Enter your Email here" 
                  required
                />
              </div>
              {/* Password Input */}
              <div className="mb-5"> {/* Giảm mb */}
                 <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="register-password"> {/* Hiển thị Label */}
                   Password
                 </label>
                <input 
                  className="appearance-none border border-gray-300 bg-gray-100 rounded w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-yellow-400" // Style input
                  id="register-password" 
                  type="password" 
                  placeholder="Enter your Password here" 
                  required
                />
              </div>
              {/* NÚT: Create Account */}
              <div className="mb-4">
                <button 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black text-base font-semibold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200" // Điều chỉnh font/padding
                  type="submit" 
                >
                  Create Account
                </button>
              </div>
            </form>
            {/* Link chuyển sang Login */}
            <p className="text-center text-gray-500 text-xs mb-4"> {/* Chữ nhỏ hơn, màu nhạt hơn */}
              Already have an account? 
              <button 
                onClick={toggleView} 
                className="text-yellow-500 hover:text-yellow-600 font-semibold ml-1 focus:outline-none" // Đổi màu link
              >
                Login
              </button>
            </p>
          </>
        ) : (
          /* ===== FORM ĐĂNG NHẬP (Login) ===== */
          <>
            <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Login to your Account</h2>
            <form>
               {/* Email Input */}
               <div className="mb-4">
                 <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="login-email">
                   Email
                 </label>
                <input 
                  className="appearance-none border border-gray-300 bg-gray-100 rounded w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-yellow-400"
                  id="login-email" 
                  type="email" 
                  placeholder="Enter your Email here" 
                  required
                />
              </div>
              {/* Password Input */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="login-password">
                  Password
                </label>
                <input 
                   className="appearance-none border border-gray-300 bg-gray-100 rounded w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-yellow-400"
                  id="login-password" 
                  type="password" 
                  placeholder="Enter your Password here" 
                  required
                />
                 {/* <a href="#" className="text-xs text-yellow-500 hover:text-yellow-600 float-right mt-1">Forgot Password?</a> */}
              </div>
              {/* NÚT: Login */}
              <div className="mb-4">
                <button 
                  className="bg-yellow-400 hover:bg-yellow-500 text-black text-base font-semibold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200"
                  type="submit" 
                >
                  Login
                </button>
              </div>
            </form>
            {/* Link chuyển sang Register */}
             <p className="text-center text-gray-500 text-xs mb-4">
              Don't have an account? 
              <button 
                onClick={toggleView} 
                className="text-yellow-500 hover:text-yellow-600 font-semibold ml-1 focus:outline-none"
              >
                Register
              </button>
            </p>
          </>
        )}

        {/* --- Phần OR và Social Login (Dùng chung cho cả 2 form) --- */}
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 after:flex-1 after:border-t after:border-gray-300">
          <p className="text-center font-semibold mx-3 mb-0 text-gray-400 text-xs">OR</p> 
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4"> 
           {/* Facebook */}
          <button type="button" className="flex items-center justify-center w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition duration-200 text-sm shadow-sm">
            <SiFacebook className="mr-2 text-base" /> {/* Dùng SiFacebook */}
            Login with Facebook
          </button>
          {/* Google */}
          <button type="button" className="flex items-center justify-center w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-50 transition duration-200 text-sm shadow-sm">
             <FcGoogle className="mr-2 text-base" /> {/* Dùng FcGoogle */}
             Sign in with Google
          </button>
           {/* LINE */}
          <button type="button" className="flex items-center justify-center w-full bg-green-500 text-white font-medium py-2 px-4 rounded hover:bg-green-600 transition duration-200 text-sm shadow-sm">
            <SiLine className="mr-2 text-base" /> {/* Dùng SiLine */}
            Log in with LINE
          </button>
          {/* Apple */}
          <button type="button" className="flex items-center justify-center w-full bg-black text-white font-medium py-2 px-4 rounded hover:bg-gray-800 transition duration-200 text-sm shadow-sm">
             <FaApple className="mr-2 text-base" /> 
             Continue with Apple
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default LoginModal;

