// src/components/ModuleAccessGuard.jsx
// Component để bảo vệ các trang module selection (level/jlpt) dựa trên module-level access control

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getModuleAccessConfigSync } from '../utils/accessControlManager.js';

function ModuleAccessGuard({ children, module }) {
  const { user, profile, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    // ✅ Merge user and profile to get role
    const userWithRole = user ? {
      ...user,
      role: profile?.role || user.role || null
    } : null;

    // Get module-level config (use sync version for performance)
    const moduleConfig = getModuleAccessConfigSync(module);
    console.log(`[ModuleAccessGuard] Checking ${module} module access:`, {
      moduleConfig,
      userId: userWithRole?.id || 'guest',
      userRole: userWithRole?.role || 'guest'
    });

    // Admin always has access
    if (userWithRole?.role === 'admin') {
      console.log(`[ModuleAccessGuard] ✅ Admin user - granted access to ${module}`);
      setChecked(true);
      return;
    }

    // If module is blocked (none), deny access
    if (moduleConfig.accessType === 'none') {
      console.log(`[ModuleAccessGuard] ❌ Module ${module} blocked (accessType: none) - denied`);
      if (!user) {
        navigate('/login');
      } else {
        alert(t('accessControl.noAccessMessage', { level: `${module.toUpperCase()} Module` }));
        navigate('/');
      }
      return;
    }

    // Check role-based blocking
    if (moduleConfig.accessType === 'role') {
      if (!userWithRole) {
        // Guest user
        if (moduleConfig.allowedRoles.includes('guest')) {
          console.log(`[ModuleAccessGuard] ❌ Guest user blocked at ${module} module level - denied`);
          navigate('/login');
          return;
        }
      } else {
        // Logged in user
        if (moduleConfig.allowedRoles.includes(userWithRole.role)) {
          console.log(`[ModuleAccessGuard] ❌ User role "${userWithRole.role}" blocked at ${module} module level - denied`);
          alert(t('accessControl.noAccessMessage', { level: `${module.toUpperCase()} Module` }));
          navigate('/');
          return;
        }
      }
    }

    // Check user-based blocking
    if (moduleConfig.accessType === 'user') {
      if (userWithRole?.id) {
        const isBlocked = moduleConfig.allowedUsers.some(blockedId => 
          blockedId === userWithRole.id || 
          String(blockedId) === String(userWithRole.id) ||
          Number(blockedId) === Number(userWithRole.id)
        );
        if (isBlocked) {
          console.log(`[ModuleAccessGuard] ❌ User ID "${userWithRole.id}" blocked at ${module} module level - denied`);
          alert(t('accessControl.noAccessMessage', { level: `${module.toUpperCase()} Module` }));
          navigate('/');
          return;
        }
      }
    }

    // Access granted (accessType === 'all' or not blocked)
    console.log(`[ModuleAccessGuard] ✅ Access granted to ${module} module`);
    setChecked(true);
  }, [user, profile, isLoading, module, navigate, t]);

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

  return children;
}

export default ModuleAccessGuard;

