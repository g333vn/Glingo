// src/components/LoginModal.jsx
// ✨ NEO BRUTALISM + JAPANESE AESTHETIC LOGIN MODAL

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FaApple } from 'react-icons/fa'; 
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiLine } from "react-icons/si";

function LoginModal({ onClose }) { 
  const [isRegisterView, setIsRegisterView] = useState(true);
  
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []); 

  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
  };

  return ReactDOM.createPortal(
    <div 
      className="modal-overlay-enter"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* ✨ NEO BRUTALISM MODAL */}
      <div 
        className="modal-content-enter"
        style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '4px solid black',
          boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
          width: '100%',
          maxWidth: '24rem',
          position: 'relative',
          margin: '2rem auto',
        }}
      >
        
        {/* ✨ NEO BRUTALISM Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-black font-black text-2xl bg-white border-[3px] border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FF5722] hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 w-8 h-8 flex items-center justify-center"
          aria-label="Close modal"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
          }}
        >
          &times;
        </button>

        {/* --- Phần Form (Render có điều kiện) --- */}
        {isRegisterView ? (
          /* ===== FORM ĐĂNG KÝ (Register) - NEO BRUTALISM ===== */
          <>
            <h2 className="text-xl font-black mb-5 text-center text-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              Create your Free Account
            </h2>
            <form>
              {/* FULL NAME Input - NEO BRUTALISM */}
              <div className="mb-4">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="full-name">
                   Full Name
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="full-name" 
                  type="text" 
                  placeholder="Enter your full name here" 
                  required 
                />
              </div>
              {/* Email Input - NEO BRUTALISM */}
              <div className="mb-4">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="register-email">
                  Email
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="register-email" 
                  type="email" 
                  placeholder="Enter your Email here" 
                  required
                />
              </div>
              {/* Password Input - NEO BRUTALISM */}
              <div className="mb-5">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="register-password">
                   Password
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="register-password" 
                  type="password" 
                  placeholder="Enter your Password here" 
                  required
                />
              </div>
              {/* ✨ NEO BRUTALISM Button: Create Account */}
              <div className="mb-4">
                <button 
                  className="bg-[#FFB800] hover:bg-[#FF5722] text-black hover:text-white text-base font-black py-2.5 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none w-full transition-all duration-200 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px]" 
                  type="submit" 
                >
                  Create Account
                </button>
              </div>
            </form>
            {/* Link chuyển sang Login - NEO BRUTALISM */}
            <p className="text-center text-gray-600 text-xs mb-4 font-bold">
              Already have an account? 
              <button 
                onClick={toggleView} 
                className="text-[#FF5722] hover:text-black hover:bg-yellow-400 px-2 py-1 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black ml-1 focus:outline-none transition-all duration-200" 
              >
                Login
              </button>
            </p>
          </>
        ) : (
          /* ===== FORM ĐĂNG NHẬP (Login) - NEO BRUTALISM ===== */
          <>
            <h2 className="text-xl font-black mb-5 text-center text-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              Login to your Account
            </h2>
            <form>
               {/* Email Input - NEO BRUTALISM */}
               <div className="mb-4">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="login-email">
                   Email
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="login-email" 
                  type="email" 
                  placeholder="Enter your Email here" 
                  required
                />
              </div>
              {/* Password Input - NEO BRUTALISM */}
              <div className="mb-5">
                <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="login-password">
                  Password
                </label>
                <input 
                   className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="login-password" 
                  type="password" 
                  placeholder="Enter your Password here" 
                  required
                />
              </div>
              {/* ✨ NEO BRUTALISM Button: Login */}
              <div className="mb-4">
                <button 
                  className="bg-[#FFB800] hover:bg-[#FF5722] text-black hover:text-white text-base font-black py-2.5 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none w-full transition-all duration-200 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px]" 
                  type="submit" 
                >
                  Login
                </button>
              </div>
            </form>
            {/* Link chuyển sang Register - NEO BRUTALISM */}
             <p className="text-center text-gray-600 text-xs mb-4 font-bold">
              Don't have an account? 
              <button 
                onClick={toggleView} 
                className="text-[#FF5722] hover:text-black hover:bg-yellow-400 px-2 py-1 rounded-md border-[2px] border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black ml-1 focus:outline-none transition-all duration-200" 
              >
                Register
              </button>
            </p>
          </>
        )}

        {/* --- Phần OR và Social Login - NEO BRUTALISM --- */}
        <div className="my-4 flex items-center before:flex-1 before:border-t-[3px] before:border-black after:flex-1 after:border-t-[3px] after:border-black">
          <p className="text-center font-black mx-3 mb-0 text-black text-xs uppercase tracking-wider">OR</p> 
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4"> 
           {/* Facebook - NEO BRUTALISM */}
          <button type="button" className="flex items-center justify-center w-full bg-blue-600 text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]">
            <SiFacebook className="mr-2 text-base" />
            <span className="hidden sm:inline">Facebook</span>
          </button>
          {/* Google - NEO BRUTALISM */}
          <button type="button" className="flex items-center justify-center w-full bg-white border-[3px] border-black text-black font-black py-2 px-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]">
             <FcGoogle className="mr-2 text-base" />
             <span className="hidden sm:inline">Google</span>
          </button>
           {/* LINE - NEO BRUTALISM */}
          <button type="button" className="flex items-center justify-center w-full bg-green-500 text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]">
            <SiLine className="mr-2 text-base" />
            <span className="hidden sm:inline">LINE</span>
          </button>
          {/* Apple - NEO BRUTALISM */}
          <button type="button" className="flex items-center justify-center w-full bg-black text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]">
             <FaApple className="mr-2 text-base" /> 
             <span className="hidden sm:inline">Apple</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default LoginModal;
