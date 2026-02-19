// src/components/DashboardAccessGuard.jsx
// DASHBOARD ACCESS GUARD
// Bảo vệ route dashboard, chỉ cho phép users có quyền truy cập

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { hasDashboardAccess } from '../utils/dashboardAccessManager.js';

function DashboardAccessGuard({ children }) {
  const { user, profile, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    // Check dashboard access - pass both user and profile
    const hasAccess = hasDashboardAccess(user, profile);
    
    if (!hasAccess) {
      // No access, redirect to home
      alert(t('dashboardAccess.noAccessMessage'));
      navigate('/');
      return;
    }

    // Access granted
    setChecked(true);
  }, [user, profile, isLoading, navigate, t]);

  // If no access, don't render children (will be redirected)
  if (isLoading || !checked) {
    return null;
  }

  return <>{children}</>;
}

export default DashboardAccessGuard;

