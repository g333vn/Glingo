// src/pages/admin/DashboardAccessPage.jsx
// DASHBOARD ACCESS CONTROL MANAGEMENT PAGE
// Quản lý quyền truy cập dashboard cho người dùng

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { getUsers } from '../../data/users.js';
import {
  getDashboardAccessConfig,
  setDashboardAccessConfig,
  resetDashboardAccess
} from '../../utils/dashboardAccessManager.js';

function DashboardAccessPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState({
    defaultLocked: true,
    allowedUsers: [],
    allowedRoles: []
  });
  const [showModal, setShowModal] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load users
      const allUsers = getUsers();
      setUsers(allUsers || []);

      // Load config
      const currentConfig = getDashboardAccessConfig();
      setConfig(currentConfig || {
        defaultLocked: true,
        allowedUsers: [],
        allowedRoles: []
      });
    } catch (error) {
      console.error('[DashboardAccessPage] Error loading data:', error);
      setUsers([]);
      setConfig({
        defaultLocked: true,
        allowedUsers: [],
        allowedRoles: []
      });
    }
  };

  const handleSave = () => {
    try {
      setDashboardAccessConfig(config);
      setShowModal(false);
      alert(t('dashboardAccess.saveSuccess'));
    } catch (error) {
      console.error('[DashboardAccessPage] Error saving config:', error);
      alert('Có lỗi xảy ra khi lưu cấu hình');
    }
  };

  const handleReset = () => {
    if (confirm(t('dashboardAccess.resetConfirm'))) {
      resetDashboardAccess();
      loadData();
      alert(t('dashboardAccess.resetSuccess'));
    }
  };

  const toggleDefaultLocked = () => {
    setConfig({ ...config, defaultLocked: !config.defaultLocked });
  };

  const toggleRole = (role) => {
    const newRoles = config.allowedRoles.includes(role)
      ? config.allowedRoles.filter(r => r !== role)
      : [...config.allowedRoles, role];
    setConfig({ ...config, allowedRoles: newRoles });
  };

  const toggleUser = (userId) => {
    const newUsers = config.allowedUsers.includes(userId)
      ? config.allowedUsers.filter(id => id !== userId)
      : [...config.allowedUsers, userId];
    setConfig({ ...config, allowedUsers: newUsers });
  };

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              🔒 {t('dashboardAccess.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('dashboardAccess.subtitle')}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1 bg-orange-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase transition-all"
          >
            {t('dashboardAccess.reset')}
          </button>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border-[3px] border-blue-400 rounded-lg">
          <p className="text-sm font-bold text-blue-900 mb-2">
            💡 <strong>{t('dashboardAccess.info.title')}</strong>
          </p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>{t('dashboardAccess.info.point1')}</li>
            <li>{t('dashboardAccess.info.point2')}</li>
            <li>{t('dashboardAccess.info.point3')}</li>
            <li>{t('dashboardAccess.info.point4')}</li>
          </ul>
        </div>

        {/* Current Status */}
        <div className="mb-6 p-4 bg-yellow-50 border-[3px] border-yellow-400 rounded-lg">
          <h3 className="text-lg font-black text-yellow-900 mb-3 uppercase">
            {t('dashboardAccess.currentStatus')}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-yellow-800">
                {t('dashboardAccess.defaultLocked')}:
              </span>
              <span className={`px-2 py-1 text-xs font-bold rounded border-[2px] ${
                config.defaultLocked 
                  ? 'bg-red-100 text-red-800 border-red-400' 
                  : 'bg-green-100 text-green-800 border-green-400'
              }`}>
                {config.defaultLocked ? t('dashboardAccess.locked') : t('dashboardAccess.unlocked')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-yellow-800">
                {t('dashboardAccess.allowedRoles')}:
              </span>
              <span className="text-xs text-yellow-700">
                {config.allowedRoles.length > 0 
                  ? config.allowedRoles.map(r => t(`accessControl.role.${r}`)).join(', ')
                  : t('dashboardAccess.none')
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-yellow-800">
                {t('dashboardAccess.allowedUsers')}:
              </span>
              <span className="text-xs text-yellow-700">
                {config.allowedUsers.length > 0 
                  ? `${config.allowedUsers.length} ${t('dashboardAccess.users')}`
                  : t('dashboardAccess.none')
                }
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
          >
            {t('dashboardAccess.edit')}
          </button>
        </div>

        {/* Edit Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
                {t('dashboardAccess.editTitle')}
              </h3>

              {/* Default Locked */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.defaultLocked}
                    onChange={toggleDefaultLocked}
                    className="w-5 h-5 border-[2px] border-black"
                  />
                  <div>
                    <div className="text-sm font-bold text-gray-700">
                      {t('dashboardAccess.defaultLocked')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('dashboardAccess.defaultLockedDesc')}
                    </div>
                  </div>
                </label>
              </div>

              {/* Allowed Roles */}
              {config.defaultLocked && (
                <div className="mb-4">
                  <div className="block text-sm font-bold text-gray-700 mb-2">
                    {t('dashboardAccess.allowedRoles')}
                  </div>
                  <div className="mb-2 p-2 bg-yellow-50 border-[2px] border-yellow-400 rounded text-xs text-yellow-800 font-bold">
                    💡 {t('dashboardAccess.adminNote')}
                  </div>
                  <div className="space-y-2">
                    {['guest', 'editor', 'user'].map((role) => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.allowedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 border-[2px] border-black"
                        />
                        <span className="text-sm font-bold">{t(`accessControl.role.${role}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Allowed Users */}
              {config.defaultLocked && (
                <div className="mb-4">
                  <div className="block text-sm font-bold text-gray-700 mb-2">
                    {t('dashboardAccess.allowedUsers')}
                  </div>
                  <div className="mb-2 p-2 bg-yellow-50 border-[2px] border-yellow-400 rounded text-xs text-yellow-800 font-bold">
                    💡 {t('dashboardAccess.adminNote')}
                  </div>
                  <div className="max-h-48 overflow-y-auto border-[2px] border-gray-300 rounded-lg p-2 space-y-2">
                    {users.filter(user => user.role !== 'admin').map((user) => (
                      <label key={user.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.allowedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="w-4 h-4 border-[2px] border-black"
                        />
                        <span className="text-sm font-bold">
                          {user.username} ({user.name || user.email || 'N/A'})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('dashboardAccess.save')}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    loadData();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('dashboardAccess.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default DashboardAccessPage;
