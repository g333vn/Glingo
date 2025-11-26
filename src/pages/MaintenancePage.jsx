// src/pages/MaintenancePage.jsx
// Simple maintenance screen shown to non-admin users when maintenanceMode is enabled

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { getSettings } from '../utils/settingsManager.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function MaintenancePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const settings = getSettings();
  const contactEmail = settings?.system?.contactEmail || 'admin@example.com';
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white/95 border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 text-center">
        <div className="text-4xl sm:text-5xl mb-4">🛠️</div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 uppercase tracking-wide">
          {t('maintenance.title') || 'Hệ thống đang bảo trì'}
        </h1>
        <p className="text-sm sm:text-base text-gray-700 font-semibold mb-4">
          {t('maintenance.message') ||
            'Chúng tôi đang bảo trì và nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút.'}
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">
          {t('maintenance.contact') || 'Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ'}:{' '}
          <a href={`mailto:${contactEmail}`} className="font-bold text-blue-600 underline">
            {contactEmail}
          </a>
        </p>
        {user && !isAdmin && (
          <p className="text-[11px] sm:text-xs text-red-600 font-semibold mb-2">
            {t('maintenance.loggedInNonAdmin') ||
              'Bạn đang đăng nhập với tài khoản không phải admin. Trong thời gian bảo trì, chỉ admin mới có thể sử dụng hệ thống.'}
          </p>
        )}
        <p className="text-[11px] sm:text-xs text-gray-500">
          {t('maintenance.note') ||
            'Admin vẫn có thể truy cập khu vực quản trị để giám sát và hoàn tất bảo trì.'}
        </p>
      </div>
    </div>
  );
}

export default MaintenancePage;