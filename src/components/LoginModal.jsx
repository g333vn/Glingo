// src/components/LoginModal.jsx
// ✨ NEO BRUTALISM + JAPANESE AESTHETIC LOGIN MODAL

import React, { useState, useEffect } from 'react';
import { FaApple } from 'react-icons/fa'; 
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiLine } from "react-icons/si";
import * as authService from '../services/authService.js';
import Modal from './Modal.jsx';

function LoginModal({ onClose, initialView = 'register' }) { 
  // ✅ UPDATED: Nhận initialView prop để set view ban đầu ('login' hoặc 'register')
  const [isRegisterView, setIsRegisterView] = useState(initialView === 'register');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  
  // ✅ UPDATED: Sync state khi initialView thay đổi
  useEffect(() => {
    setIsRegisterView(initialView === 'register');
    setError(null);
  }, [initialView]); 

  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
  };

  // ✅ NEW: Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // ✅ FIX: Actual login/register logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegisterView) {
        // Register
        if (!formData.fullName || !formData.email || !formData.password) {
          setError('Vui lòng điền đầy đủ thông tin');
          setIsLoading(false);
          return;
        }

        const result = await authService.signUp({
          email: formData.email,
          password: formData.password,
          displayName: formData.fullName
        });

        if (result.success) {
          alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
          onClose();
        } else {
          setError(result.error || 'Đăng ký thất bại');
        }
      } else {
        // Login
        if (!formData.email || !formData.password) {
          setError('Vui lòng nhập email và password');
          setIsLoading(false);
          return;
        }

        const result = await authService.signIn({
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          alert('Đăng nhập thành công!');
          onClose();
        } else {
          setError(result.error || 'Đăng nhập thất bại');
        }
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Social login handlers (placeholder)
  const handleSocialLogin = (provider) => {
    console.log('Social login with:', provider);
    alert(`${provider} login functionality coming soon!`);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      maxWidth="24rem"
      showCloseButton={true}
      closeOnEscape={true}
      closeOnClickOutside={true}
      className=""
    >

        {/* --- Phần Form (Render có điều kiện) --- */}
        {isRegisterView ? (
          /* ===== FORM ĐĂNG KÝ (Register) - NEO BRUTALISM ===== */
          <>
            <h2 className="text-xl font-black mb-5 text-center text-black uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
              Create your Free Account
            </h2>
            <form onSubmit={handleSubmit}>
              {/* FULL NAME Input - NEO BRUTALISM */}
              <div className="mb-4">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="full-name">
                   Full Name
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="full-name" 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your Password here" 
                  required
                />
              </div>
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm font-bold">{error}</p>
                </div>
              )}
              {/* ✨ NEO BRUTALISM Button: Create Account */}
              <div className="mb-4">
                <button 
                  className="bg-[#FFB800] hover:bg-[#FF5722] text-black hover:text-white text-base font-black py-2.5 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none w-full transition-all duration-200 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang tạo tài khoản...' : 'Create Account'}
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
            <form onSubmit={handleSubmit}>
               {/* Email Input - NEO BRUTALISM */}
               <div className="mb-4">
                 <label className="block text-black text-sm font-black mb-1 uppercase tracking-wide" htmlFor="login-email">
                   Email
                 </label>
                <input 
                  className="appearance-none border-[3px] border-black bg-white rounded-lg w-full py-2.5 px-4 text-black leading-tight focus:outline-none focus:bg-yellow-400 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold transition-all duration-200" 
                  id="login-email" 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your Password here" 
                  required
                />
              </div>
              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg">
                  <p className="text-red-700 text-sm font-bold">{error}</p>
                </div>
              )}
              {/* ✨ NEO BRUTALISM Button: Login */}
              <div className="mb-4">
                <button 
                  className="bg-[#FFB800] hover:bg-[#FF5722] text-black hover:text-white text-base font-black py-2.5 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none w-full transition-all duration-200 uppercase tracking-wide hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Login'}
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
          <button 
            type="button" 
            onClick={() => handleSocialLogin('Facebook')}
            className="flex items-center justify-center w-full bg-blue-600 text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <SiFacebook className="mr-2 text-base" />
            <span className="hidden sm:inline">Facebook</span>
          </button>
          {/* Google - NEO BRUTALISM */}
          <button 
            type="button" 
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center w-full bg-white border-[3px] border-black text-black font-black py-2 px-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
             <FcGoogle className="mr-2 text-base" />
             <span className="hidden sm:inline">Google</span>
          </button>
           {/* LINE - NEO BRUTALISM */}
          <button 
            type="button" 
            onClick={() => handleSocialLogin('LINE')}
            className="flex items-center justify-center w-full bg-green-500 text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            <SiLine className="mr-2 text-base" />
            <span className="hidden sm:inline">LINE</span>
          </button>
          {/* Apple - NEO BRUTALISM */}
          <button 
            type="button" 
            onClick={() => handleSocialLogin('Apple')}
            className="flex items-center justify-center w-full bg-black text-white font-black py-2 px-4 rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
             <FaApple className="mr-2 text-base" /> 
             <span className="hidden sm:inline">Apple</span>
          </button>
        </div>
    </Modal>
  );
}

export default LoginModal;
