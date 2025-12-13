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
  const [accessControlReady, setAccessControlReady] = useState(false);
  
  // Get levelId from prop or params
  const levelId = propLevelId || params.levelId?.toLowerCase();
  const moduleType = module || (params.levelId ? 'level' : 'jlpt');

  // ✅ NEW: Wait for access control to be loaded from Supabase
  useEffect(() => {
    // Check if access control is already in localStorage (means it's been loaded)
    const hasLevelConfig = localStorage.getItem('levelAccessControl');
    const hasJlptConfig = localStorage.getItem('jlptAccessControl');
    
    if (hasLevelConfig || hasJlptConfig) {
      console.log('[AccessGuard] ✅ Access control already in localStorage');
      setAccessControlReady(true);
      return;
    }
    
    // Wait for accessControlUpdated event (means Supabase data has been loaded)
    const handleAccessControlUpdate = () => {
      console.log('[AccessGuard] ✅ Access control loaded from Supabase');
      setAccessControlReady(true);
      setChecked(false); // Force re-check
    };

    window.addEventListener('accessControlUpdated', handleAccessControlUpdate);
    
    // Also set a timeout to allow app to continue even if event doesn't fire
    const timeout = setTimeout(() => {
      console.log('[AccessGuard] ⚠️ Access control load timeout, proceeding with localStorage');
      setAccessControlReady(true);
    }, 2000); // 2 second timeout
    
    return () => {
      window.removeEventListener('accessControlUpdated', handleAccessControlUpdate);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    // Wait for auth and access control to load
    if (isLoading || !accessControlReady) {
      return;
    }

    // ✅ FIXED: Merge user and profile to get role
    // Role is stored in profile, not user object
    const userWithRole = user ? {
      ...user,
      role: profile?.role || user.role || null
    } : null;

    // ✅ DEBUG: Log current config from localStorage
    const storageKey = moduleType === 'level' ? 'levelAccessControl' : 'jlptAccessControl';
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const configs = JSON.parse(stored);
      const config = configs[levelId];
      console.log(`[AccessGuard] 🔍 Checking access for ${moduleType}/${levelId}:`, {
        config: config || 'default',
        userRole: userWithRole?.role || 'guest',
        userId: userWithRole?.id || 'guest'
      });
    }

    // Check access (user can be null for guest users)
    const hasLevelAccess = hasAccess(moduleType, levelId, userWithRole);
    
    console.log(`[AccessGuard] ✅ Access check result for ${moduleType}/${levelId}:`, hasLevelAccess);
    
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
  }, [user, profile, isLoading, levelId, moduleType, navigate, t, accessControlReady]);

  // Show loading while checking
  if (isLoading || !accessControlReady || !checked) {
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
