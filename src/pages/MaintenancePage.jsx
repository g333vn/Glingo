// src/pages/MaintenancePage.jsx
// Simple maintenance screen shown to non-admin users when maintenanceMode is enabled

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings } from '../utils/settingsManager.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function MaintenancePage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const settings = getSettings();
  const contactEmail = settings?.system?.contactEmail || 'admin@example.com';
  // Get role from profile (role is in profile, not user)
  const userRole = profile?.role || user?.role;
  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white/95 border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
        <div className="text-4xl sm:text-5xl mb-4">🛠️</div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 uppercase tracking-wide">
          {t('maintenance.title')}
        </h1>
        <p className="text-sm sm:text-base text-gray-700 font-semibold mb-4">
          {t('maintenance.message')}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          {t('maintenance.contact')}:{' '}
          <a href={`mailto:${contactEmail}`} className="font-bold text-blue-600 underline">
            {contactEmail}
          </a>
        </p>
        {user && !isAdmin && (
          <p className="text-[11px] sm:text-xs text-red-600 font-semibold mb-2">
            {t('maintenance.loggedInNonAdmin')}
          </p>
        )}
        <p className="text-[11px] sm:text-xs text-gray-500">
          {t('maintenance.note')}
        </p>
      </div>
    </div>
  );
}

export default MaintenancePage;