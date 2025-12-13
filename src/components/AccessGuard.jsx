// src/components/AccessGuard.jsx
// Component để bảo vệ các trang level detail dựa trên access control

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { hasAccess } from '../utils/accessControlManager.js';

function AccessGuard({ children, module, levelId: propLevelId }) {
  const { user, profile, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  const [checked, setChecked] = useState(false);
  
  // Get levelId from prop or params
  const levelId = propLevelId || params.levelId?.toLowerCase();
  const moduleType = module || (params.levelId ? 'level' : 'jlpt');

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    // ✅ FIXED: Merge user and profile to get role
    // Role is stored in profile, not user object
    const userWithRole = user ? {
      ...user,
      role: profile?.role || user.role || null
    } : null;

    // Check access (user can be null for guest users)
    const hasLevelAccess = hasAccess(moduleType, levelId, userWithRole);
    
    if (!hasLevelAccess) {
      // No access
      if (!user) {
        // Guest user without access, redirect to login
        navigate('/login');
      } else {
        // Logged in user without access, redirect to level selection page
        const redirectPath = moduleType === 'level' ? '/level' : '/jlpt';
        alert(t('accessControl.noAccessMessage', { level: levelId?.toUpperCase() || 'N/A' }));
        navigate(redirectPath);
      }
      return;
    }

    // Access granted
    setChecked(true);
  }, [user, profile, isLoading, levelId, moduleType, navigate, t]);

  // Show loading while checking
  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // If no access, don't render children (will be redirected)
  // ✅ FIXED: Merge user and profile to get role
  const userWithRole = user ? {
    ...user,
    role: profile?.role || user.role || null
  } : null;
  const hasLevelAccess = hasAccess(moduleType, levelId, userWithRole);
  if (!hasLevelAccess) {
    return null;
  }

  return children;
}

export default AccessGuard;
