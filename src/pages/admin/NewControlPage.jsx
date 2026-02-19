// src/pages/admin/NewControlPage.jsx
// ACCESS CONTROL MANAGEMENT PAGE
// Quản lý quyền truy cập cho các module LEVEL và JLPT
// NEO BRUTALISM DESIGN

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { getUsers } from '../../data/users.js';
import {
  getAllAccessConfigs,
  setAccessConfig,
  initializeDefaultConfigs,
  resetModuleConfigs,
  getModuleAccessConfig,
  getModuleAccessConfigSync,
  setModuleAccessConfig
} from '../../utils/accessControlManager.js';
import { getAccessControlFromSupabase } from '../../services/accessControlService.js';
import {
  getDashboardAccessConfig,
  setDashboardAccessConfig,
  resetDashboardAccess
} from '../../utils/dashboardAccessManager.js';

function NewControlPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [levelConfigs, setLevelConfigs] = useState({});
  const [jlptConfigs, setJlptConfigs] = useState({});
  const [levelModuleConfig, setLevelModuleConfig] = useState(null);
  const [jlptModuleConfig, setJlptModuleConfig] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
  const modules = [
    { id: 'level', name: t('accessControl.module.level') },
    { id: 'jlpt', name: t('accessControl.module.jlpt') }
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load users
    const allUsers = getUsers();
    setUsers(allUsers);

    // FIXED: Initialize default configs (only for levels without config)
    // This will NOT overwrite existing configs
    await initializeDefaultConfigs('level');
    await initializeDefaultConfigs('jlpt');
    
    // NEW: Try to load from Supabase first, then fallback to localStorage
    try {
      const { success, data } = await getAccessControlFromSupabase();
      if (success && data) {
        console.log('[NewControlPage] ✅ Loaded access configs from Supabase');
        // Update state with Supabase data
        setLevelConfigs(data.levelConfigs || {});
        setJlptConfigs(data.jlptConfigs || {});
        setLevelModuleConfig(data.levelModuleConfig || { accessType: 'all', allowedRoles: [], allowedUsers: [] });
        setJlptModuleConfig(data.jlptModuleConfig || { accessType: 'all', allowedRoles: [], allowedUsers: [] });
        
        // Also sync to localStorage for offline access
        if (data.levelConfigs) {
          localStorage.setItem('levelAccessControl', JSON.stringify(data.levelConfigs));
        }
        if (data.jlptConfigs) {
          localStorage.setItem('jlptAccessControl', JSON.stringify(data.jlptConfigs));
        }
        if (data.levelModuleConfig) {
          localStorage.setItem('levelModuleAccessControl', JSON.stringify(data.levelModuleConfig));
        }
        if (data.jlptModuleConfig) {
          localStorage.setItem('jlptModuleAccessControl', JSON.stringify(data.jlptModuleConfig));
        }
      } else {
        // Fallback to localStorage
        console.log('[NewControlPage] ⚠️ Failed to load from Supabase, using localStorage');
        setLevelConfigs(getAllAccessConfigs('level'));
        setJlptConfigs(getAllAccessConfigs('jlpt'));
        setLevelModuleConfig(getModuleAccessConfigSync('level'));
        setJlptModuleConfig(getModuleAccessConfigSync('jlpt'));
      }
    } catch (err) {
      console.warn('[NewControlPage] ⚠️ Error loading from Supabase, using localStorage:', err);
      setLevelConfigs(getAllAccessConfigs('level'));
      setJlptConfigs(getAllAccessConfigs('jlpt'));
      setLevelModuleConfig(getModuleAccessConfigSync('level'));
      setJlptModuleConfig(getModuleAccessConfigSync('jlpt'));
    }
    
    // Load dashboard config
    setDashboardConfig(getDashboardAccessConfig());
    
    console.log('[NewControlPage] ✅ Loaded access configs:', {
      levelConfigs: Object.keys(getAllAccessConfigs('level')).length,
      jlptConfigs: Object.keys(getAllAccessConfigs('jlpt')).length,
      levelModule: getModuleAccessConfigSync('level'),
      jlptModule: getModuleAccessConfigSync('jlpt')
    });
  };

  const handleEdit = (module, levelId) => {
    const configs = module === 'level' ? levelConfigs : jlptConfigs;
    const config = configs[levelId] || {
      accessType: 'all',
      allowedRoles: [],
      allowedUsers: []
    };
    
    setEditingConfig({
      module,
      levelId,
      ...config
    });
    setUserSearchTerm(''); // Reset search when opening modal
    setShowModal(true);
  };

  const handleEditModule = (module) => {
    const moduleConfig = module === 'level' ? levelModuleConfig : jlptModuleConfig;
    const config = moduleConfig || {
      accessType: 'all',
      allowedRoles: [],
      allowedUsers: []
    };
    
    setEditingConfig({
      module,
      levelId: null, // null means module-level
      ...config
    });
    setUserSearchTerm(''); // Reset search when opening modal
    setShowModal(true);
  };

  const handleEditDashboard = () => {
    const config = dashboardConfig || {
      defaultLocked: true,
      allowedRoles: [],
      allowedUsers: []
    };
    
    setEditingConfig({
      module: 'dashboard',
      levelId: null,
      ...config
    });
    setUserSearchTerm(''); // Reset search when opening modal
    setShowModal(true);
  };

  const handleResetDashboard = () => {
    if (confirm(t('dashboardAccess.resetConfirm'))) {
      resetDashboardAccess();
      loadData();
      alert(t('dashboardAccess.resetSuccess'));
    }
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    const { module, levelId, ...config } = editingConfig;
    
    if (module === 'dashboard') {
      // Dashboard config
      setDashboardAccessConfig(config);
      setDashboardConfig(getDashboardAccessConfig());
    } else if (levelId === null) {
      // Module-level config
      // FIXED: Save to Supabase (async)
      const success = await setModuleAccessConfig(module, config);
      if (success) {
        // Reload from Supabase to ensure sync
        await loadData();
      } else {
        // If save failed, still update from localStorage
        if (module === 'level') {
          setLevelModuleConfig(getModuleAccessConfigSync('level'));
        } else {
          setJlptModuleConfig(getModuleAccessConfigSync('jlpt'));
        }
      }
    } else {
      // Level-specific config
      // FIXED: Save to Supabase (async)
      const success = await setAccessConfig(module, levelId, config);
      if (success) {
        // Reload from Supabase to ensure sync
        await loadData();
      } else {
        // If save failed, still update from localStorage
        if (module === 'level') {
          setLevelConfigs(getAllAccessConfigs('level'));
        } else {
          setJlptConfigs(getAllAccessConfigs('jlpt'));
        }
      }
    }

    setShowModal(false);
    setEditingConfig(null);
    alert(t('accessControl.save') === 'Lưu' ? 'Đã lưu thành công và đồng bộ lên Supabase' : t('dashboardAccess.saveSuccess'));
  };

  const handleResetModule = async (module) => {
    if (confirm(t('accessControl.resetConfirm', { module: modules.find(m => m.id === module)?.name }))) {
      await resetModuleConfigs(module);
      await loadData();
      alert(t('accessControl.resetSuccess') || 'Đã reset module thành công');
    }
  };

  const getAccessTypeLabel = (accessType) => {
    switch (accessType) {
      case 'all': return t('accessControl.accessType.all');
      case 'role': return t('accessControl.accessType.role');
      case 'user': return t('accessControl.accessType.user');
      case 'none': return t('accessControl.accessType.none');
      default: return accessType;
    }
  };

  const getAccessTypeColor = (accessType) => {
    switch (accessType) {
      case 'all': return 'bg-green-100 text-green-800 border-green-400';
      case 'role': return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'user': return 'bg-purple-100 text-purple-800 border-purple-400';
      case 'none': return 'bg-red-100 text-red-800 border-red-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const renderConfigTable = (module) => {
    const configs = module === 'level' ? levelConfigs : jlptConfigs;
    const moduleConfig = module === 'level' ? levelModuleConfig : jlptModuleConfig;

    return (
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <h3 className="text-base sm:text-lg font-black text-gray-800 uppercase tracking-wide">
            {modules.find(m => m.id === module)?.name}
          </h3>
          <button
            onClick={() => handleResetModule(module)}
            className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] sm:text-xs uppercase transition-all"
          >
            {t('accessControl.resetModule')}
          </button>
        </div>

        {/* Module-level Control */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-[3px] border-yellow-400 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
            <h4 className="text-xs sm:text-sm font-black text-yellow-900 uppercase tracking-wide">
              🔒 {t('accessControl.moduleLevel.title')}
            </h4>
            <button
              onClick={() => handleEditModule(module)}
              className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] sm:text-xs uppercase transition-all"
            >
              {t('accessControl.edit')}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs font-bold text-yellow-800">
              {t('accessControl.moduleLevel.current')}:
            </span>
            <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded border-[2px] ${getAccessTypeColor(moduleConfig?.accessType || 'all')}`}>
              {getAccessTypeLabel(moduleConfig?.accessType || 'all')}
            </span>
            {moduleConfig?.accessType === 'role' && moduleConfig.allowedRoles.length > 0 && (
              <span className="text-[10px] sm:text-xs text-yellow-800 font-semibold">
                ({moduleConfig.allowedRoles.filter(r => r !== 'admin').map(r => t(`accessControl.role.${r}`)).join(', ')})
              </span>
            )}
            {moduleConfig?.accessType === 'user' && moduleConfig.allowedUsers.length > 0 && (
              <span className="text-[10px] sm:text-xs text-yellow-800 font-semibold">
                ({moduleConfig.allowedUsers.length} {t('accessControl.moduleLevel.usersBlocked')})
              </span>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-yellow-700 mt-2 font-semibold">
            {t('accessControl.moduleLevel.description')}
          </p>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[600px] sm:min-w-[800px] border-[3px] border-black">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                  {t('accessControl.table.level')}
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                  {t('accessControl.table.accessType')}
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                  {t('accessControl.table.allowedRoles')}
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                  {t('accessControl.table.allowedUsers')}
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-700 uppercase border-b-[2px] border-black">
                  {t('accessControl.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {levels.map((levelId) => {
                const config = configs[levelId] || {
                  accessType: 'all',
                  allowedRoles: [],
                  allowedUsers: []
                };

                // Handle display based on access type
                let allowedRolesText = '-';
                let allowedUsersText = '-';

                if (config.accessType === 'none') {
                  // If access is blocked, show "Blocked" instead of "-"
                  allowedRolesText = t('accessControl.blocked');
                  allowedUsersText = t('accessControl.blocked');
                } else if (config.accessType === 'role') {
                  // Show blocked roles when access type is "role"
                  allowedRolesText = config.allowedRoles.length > 0
                    ? config.allowedRoles
                        .filter(r => r !== 'admin') // Filter out admin from display
                        .map(r => t(`accessControl.role.${r}`))
                        .join(', ') || '-'
                    : '-';
                  allowedUsersText = '-';
                } else if (config.accessType === 'user') {
                  // Show blocked users when access type is "user"
                  allowedUsersText = config.allowedUsers.length > 0
                    ? config.allowedUsers.map(uid => {
                        const user = users.find(u => u.id === uid);
                        return user ? user.username : `ID:${uid}`;
                      }).join(', ')
                    : '-';
                  allowedRolesText = '-';
                } else if (config.accessType === 'all') {
                  // When access is "all", show "-"
                  allowedRolesText = '-';
                  allowedUsersText = '-';
                }

                return (
                  <tr key={levelId} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-gray-900 uppercase">
                      {levelId.toUpperCase()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded border-[2px] ${getAccessTypeColor(config.accessType)}`}>
                        {getAccessTypeLabel(config.accessType)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                      {allowedRolesText}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                      <div className="max-w-xs truncate" title={allowedUsersText}>
                        {allowedUsersText}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <button
                        onClick={() => handleEdit(module, levelId)}
                        className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] sm:text-xs uppercase transition-all"
                      >
                        {t('accessControl.edit')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              🔒 {t('accessControl.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('accessControl.subtitle')}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-[3px] border-blue-400 rounded-lg">
          <p className="text-xs sm:text-sm font-bold text-blue-900 mb-2">
            💡 <strong>{t('accessControl.info.title')}</strong>
          </p>
          <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>{t('accessControl.info.point1')}</li>
            <li>{t('accessControl.info.point2')}</li>
            <li>{t('accessControl.info.point3')}</li>
            <li>{t('accessControl.info.point4')}</li>
          </ul>
        </div>

        {/* Dashboard Access Control */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
            <h3 className="text-base sm:text-lg font-black text-gray-800 uppercase tracking-wide">
              🔒 {t('dashboardAccess.title')}
            </h3>
            <button
              onClick={handleResetDashboard}
              className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] sm:text-xs uppercase transition-all"
            >
              {t('dashboardAccess.reset')}
            </button>
          </div>

          {/* Dashboard Control Box */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border-[3px] border-yellow-400 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
              <h4 className="text-xs sm:text-sm font-black text-yellow-900 uppercase tracking-wide">
                🔒 {t('dashboardAccess.title')}
              </h4>
              <button
                onClick={handleEditDashboard}
                className="px-2 sm:px-3 py-1 bg-yellow-500 text-white rounded-lg border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-[10px] sm:text-xs uppercase transition-all"
              >
                {t('accessControl.edit')}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs font-bold text-yellow-800">
                {t('dashboardAccess.currentStatus')}:
              </span>
              <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded border-[2px] ${
                dashboardConfig?.defaultLocked 
                  ? 'bg-red-100 text-red-800 border-red-400' 
                  : 'bg-green-100 text-green-800 border-green-400'
              }`}>
                {dashboardConfig?.defaultLocked ? t('dashboardAccess.locked') : t('dashboardAccess.unlocked')}
              </span>
              {dashboardConfig?.defaultLocked && dashboardConfig.allowedRoles.length > 0 && (
                <span className="text-[10px] sm:text-xs text-yellow-800 font-semibold">
                  ({dashboardConfig.allowedRoles.map(r => t(`accessControl.role.${r}`)).join(', ')})
                </span>
              )}
              {dashboardConfig?.defaultLocked && dashboardConfig.allowedUsers.length > 0 && (
                <span className="text-[10px] sm:text-xs text-yellow-800 font-semibold">
                  ({dashboardConfig.allowedUsers.length} {t('dashboardAccess.users')})
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-yellow-700 mt-2 font-semibold">
              {t('dashboardAccess.info.point1')}
            </p>
          </div>
        </div>

        {/* Tables */}
        {renderConfigTable('level')}
        {renderConfigTable('jlpt')}

        {/* Edit Modal */}
        {showModal && editingConfig && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-gray-800 mb-4 uppercase tracking-wide">
                {editingConfig.module === 'dashboard'
                  ? t('dashboardAccess.editTitle')
                  : editingConfig.levelId === null
                    ? t('accessControl.moduleLevel.editTitle', {
                        module: modules.find(m => m.id === editingConfig.module)?.name
                      })
                    : t('accessControl.editTitle', {
                        module: modules.find(m => m.id === editingConfig.module)?.name,
                        level: editingConfig.levelId.toUpperCase()
                      })}
              </h3>

              {/* Dashboard Config Form */}
              {editingConfig.module === 'dashboard' ? (
                <>
                  {/* Default Locked */}
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingConfig.defaultLocked}
                        onChange={(e) => setEditingConfig({ ...editingConfig, defaultLocked: e.target.checked })}
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
                  {editingConfig.defaultLocked && (
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
                              checked={editingConfig.allowedRoles.includes(role)}
                              onChange={(e) => {
                                const newRoles = e.target.checked
                                  ? [...editingConfig.allowedRoles, role]
                                  : editingConfig.allowedRoles.filter(r => r !== role);
                                setEditingConfig({ ...editingConfig, allowedRoles: newRoles });
                              }}
                              className="w-4 h-4 border-[2px] border-black"
                            />
                            <span className="text-sm font-bold">{t(`accessControl.role.${role}`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allowed Users */}
                  {editingConfig.defaultLocked && (
                    <div className="mb-4">
                      <div className="block text-sm font-bold text-gray-700 mb-2">
                        {t('dashboardAccess.allowedUsers')}
                      </div>
                      <div className="mb-2 p-2 bg-yellow-50 border-[2px] border-yellow-400 rounded text-xs text-yellow-800 font-bold">
                        💡 {t('dashboardAccess.adminNote')}
                      </div>
                      {/* Search Box */}
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder={t('accessControl.form.searchUsers') || 'Tìm kiếm user...'}
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border-[2px] border-gray-400 rounded-lg text-sm font-bold focus:border-black focus:outline-none"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto border-[2px] border-gray-300 rounded-lg p-2 space-y-2">
                        {users
                          .filter(user => user.role !== 'admin')
                          .filter(user => {
                            if (!userSearchTerm) return true;
                            const searchLower = userSearchTerm.toLowerCase();
                            return (
                              user.username?.toLowerCase().includes(searchLower) ||
                              user.name?.toLowerCase().includes(searchLower) ||
                              user.email?.toLowerCase().includes(searchLower) ||
                              String(user.id).toLowerCase().includes(searchLower)
                            );
                          })
                          .map((user) => (
                          <label key={user.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingConfig.allowedUsers.includes(user.id)}
                              onChange={(e) => {
                                const newUsers = e.target.checked
                                  ? [...editingConfig.allowedUsers, user.id]
                                  : editingConfig.allowedUsers.filter(uid => uid !== user.id);
                                setEditingConfig({ ...editingConfig, allowedUsers: newUsers });
                              }}
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
                </>
              ) : (
                <>
                  {/* Access Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('accessControl.form.accessType')}
                    </label>
                    <select
                      value={editingConfig.accessType}
                      onChange={(e) => setEditingConfig({ ...editingConfig, accessType: e.target.value })}
                      className="w-full px-4 py-2 border-[3px] border-black rounded-lg font-bold"
                    >
                      <option value="all">{t('accessControl.accessType.all')}</option>
                      <option value="role">{t('accessControl.accessType.role')}</option>
                      <option value="user">{t('accessControl.accessType.user')}</option>
                      <option value="none">{t('accessControl.accessType.none')}</option>
                    </select>
                  </div>

                  {/* Allowed Roles */}
                  {editingConfig.accessType === 'role' && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('accessControl.form.allowedRoles')}
                      </label>
                      <div className="mb-2 p-2 bg-yellow-50 border-[2px] border-yellow-400 rounded text-xs text-yellow-800 font-bold">
                        💡 {t('accessControl.adminNote')}
                      </div>
                      <div className="space-y-2">
                        {['guest', 'editor', 'user'].map((role) => (
                          <label key={role} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingConfig.allowedRoles.includes(role)}
                              onChange={(e) => {
                                const newRoles = e.target.checked
                                  ? [...editingConfig.allowedRoles, role]
                                  : editingConfig.allowedRoles.filter(r => r !== role);
                                setEditingConfig({ ...editingConfig, allowedRoles: newRoles });
                              }}
                              className="w-4 h-4 border-[2px] border-black"
                            />
                            <span className="text-sm font-bold">{t(`accessControl.role.${role}`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allowed Users */}
                  {editingConfig.accessType === 'user' && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {t('accessControl.form.allowedUsers')}
                      </label>
                      <div className="mb-2 p-2 bg-yellow-50 border-[2px] border-yellow-400 rounded text-xs text-yellow-800 font-bold">
                        💡 {t('accessControl.adminNote')}
                      </div>
                      {/* Search Box */}
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder={t('accessControl.form.searchUsers') || 'Tìm kiếm user...'}
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border-[2px] border-gray-400 rounded-lg text-sm font-bold focus:border-black focus:outline-none"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto border-[2px] border-gray-300 rounded-lg p-2 space-y-2">
                        {users
                          .filter(user => user.role !== 'admin')
                          .filter(user => {
                            if (!userSearchTerm) return true;
                            const searchLower = userSearchTerm.toLowerCase();
                            return (
                              user.username?.toLowerCase().includes(searchLower) ||
                              user.name?.toLowerCase().includes(searchLower) ||
                              user.email?.toLowerCase().includes(searchLower) ||
                              String(user.id).toLowerCase().includes(searchLower)
                            );
                          })
                          .map((user) => (
                          <label key={user.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editingConfig.allowedUsers.includes(user.id)}
                              onChange={(e) => {
                                const newUsers = e.target.checked
                                  ? [...editingConfig.allowedUsers, user.id]
                                  : editingConfig.allowedUsers.filter(uid => uid !== user.id);
                                setEditingConfig({ ...editingConfig, allowedUsers: newUsers });
                              }}
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
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('accessControl.save')}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingConfig(null);
                    setUserSearchTerm(''); // Reset search when closing modal
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase transition-all"
                >
                  {t('accessControl.cancel')}
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

export default NewControlPage;
