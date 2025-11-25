// src/pages/admin/SettingsPage.jsx
// ⚙️ SYSTEM SETTINGS PAGE - PHASE 1
// ✨ NEO BRUTALISM DESIGN

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { getSettings, saveSettings, resetSettings, exportSettings, importSettings } from '../../utils/settingsManager.js';
import { resetToFactoryDefaults } from '../../utils/seedManager.js';
import { clearDeletedUsers } from '../../data/users.js';
import { SEED_CONFIG } from '../../data/seedData.js';
import ToggleSwitch from '../../components/settings/ToggleSwitch.jsx';
import SettingsSection from '../../components/settings/SettingsSection.jsx';

function SettingsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [settings, setSettings] = useState(getSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
  }, []);

  // Update setting helper
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Save settings
  const handleSave = () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const success = saveSettings(settings);
      
      if (success) {
        setHasChanges(false);
        setSaveMessage({ type: 'success', text: t('settings.messages.saveSuccess') });
        
        // Auto-hide message after 3s
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: t('settings.messages.saveError') });
      }
    } catch (error) {
      console.error('[SETTINGS] Save error:', error);
      setSaveMessage({ type: 'error', text: t('settings.messages.saveErrorDetail', { error: error.message }) });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm(t('settings.messages.resetConfirm'))) {
      const defaults = resetSettings();
      setSettings(defaults);
      setHasChanges(false);
      setSaveMessage({ type: 'success', text: t('settings.messages.resetSuccess') });
    }
  };

  // Export settings
  const handleExport = () => {
    try {
      const json = exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSaveMessage({ type: 'success', text: t('settings.messages.exportSuccess') });
    } catch (error) {
      setSaveMessage({ type: 'error', text: t('settings.messages.exportError', { error: error.message }) });
    }
  };

  // Import settings
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = importSettings(event.target.result);
          if (result.success) {
            setSettings(result.settings);
            setHasChanges(false);
            setSaveMessage({ type: 'success', text: t('settings.messages.importSuccess') });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setSaveMessage({ type: 'error', text: t('settings.messages.importError', { message: result.message }) });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 flex justify-center px-3 sm:px-5 md:px-6">
      <div className="w-full max-w-[1100px] min-w-0 bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sticky top-20 md:top-24 h-[calc(100vh-80px-1px)] md:h-[calc(100vh-120px-1px)] max-h-[calc(100vh-80px-1px)] md:max-h-[calc(100vh-120px-1px)] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between pt-4 sm:pt-6">
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide"
              style={{ fontFamily: "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', sans-serif" }}
            >
              ⚙️ Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-semibold">
              {t('settings.subtitle')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-purple-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-xs flex items-center gap-2"
            >
              <span>📥</span>
              <span>{t('settings.export')}</span>
            </button>
            <button
              onClick={handleImport}
              className="px-3 py-2 bg-cyan-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-xs flex items-center gap-2"
            >
              <span>📤</span>
              <span>{t('settings.import')}</span>
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide text-xs flex items-center gap-2"
            >
              <span>🔄</span>
              <span>{t('settings.reset')}</span>
            </button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`p-4 rounded-lg border-[3px] ${
            saveMessage.type === 'success' 
              ? 'bg-green-100 border-green-400' 
              : 'bg-red-100 border-red-400'
          } flex items-center gap-2 font-bold text-sm animate-fade-in`}>
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* ========== 1. SYSTEM SETTINGS ========== */}
        <SettingsSection
        title={t('settings.system.title')}
        icon="🏢"
        description={t('settings.system.description')}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.system.platformName')}
            </label>
            <input
              type="text"
              value={settings.system.platformName}
              onChange={(e) => updateSetting('system', 'platformName', e.target.value)}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              placeholder={t('settings.system.platformNamePlaceholder')}
            />
          </div>

          {/* Platform Tagline */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.system.platformTagline')}
            </label>
            <input
              type="text"
              value={settings.system.platformTagline}
              onChange={(e) => updateSetting('system', 'platformTagline', e.target.value)}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              placeholder={t('settings.system.platformTaglinePlaceholder')}
            />
          </div>

          {/* Platform Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.system.platformDescription')}
            </label>
            <textarea
              value={settings.system.platformDescription}
              onChange={(e) => updateSetting('system', 'platformDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] resize-y"
              placeholder={t('settings.system.platformDescriptionPlaceholder')}
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.system.contactEmail')}
            </label>
            <input
              type="email"
              value={settings.system.contactEmail}
              onChange={(e) => updateSetting('system', 'contactEmail', e.target.value)}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              placeholder="admin@example.com"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t-[2px] border-gray-200">
            <ToggleSwitch
              label={t('settings.system.maintenanceMode')}
              description={t('settings.system.maintenanceModeDesc')}
              checked={settings.system.maintenanceMode}
              onChange={(value) => updateSetting('system', 'maintenanceMode', value)}
            />
            
            <ToggleSwitch
              label={t('settings.system.registrationEnabled')}
              description={t('settings.system.registrationEnabledDesc')}
              checked={settings.system.registrationEnabled}
              onChange={(value) => updateSetting('system', 'registrationEnabled', value)}
            />
            
            <ToggleSwitch
              label={t('settings.system.debugMode')}
              description={t('settings.system.debugModeDesc')}
              checked={settings.system.debugMode}
              onChange={(value) => updateSetting('system', 'debugMode', value)}
            />
            
            <ToggleSwitch
              label={t('settings.system.analyticsTracking')}
              description={t('settings.system.analyticsTrackingDesc')}
              checked={settings.system.analyticsEnabled}
              onChange={(value) => updateSetting('system', 'analyticsEnabled', value)}
            />
          </div>
        </div>
        </SettingsSection>

        {/* ========== 2. USER MANAGEMENT SETTINGS ========== */}
        <SettingsSection
        title={t('settings.users.title')}
        icon="👥"
        description={t('settings.users.description')}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Default Role */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.users.defaultRole')}
            </label>
            <select
              value={settings.users.defaultRole}
              onChange={(e) => updateSetting('users', 'defaultRole', e.target.value)}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <option value="user">{t('settings.users.roleUser')}</option>
              <option value="editor">{t('settings.users.roleEditor')}</option>
              <option value="admin">{t('settings.users.roleAdmin')}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('settings.users.defaultRoleHint')}
            </p>
          </div>

          {/* Password Length */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {t('settings.users.passwordMinLength')}
              </label>
              <input
                type="number"
                min="4"
                max="50"
                value={settings.users.passwordMinLength}
                onChange={(e) => updateSetting('users', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                {t('settings.users.passwordMaxLength')}
              </label>
              <input
                type="number"
                min="6"
                max="100"
                value={settings.users.passwordMaxLength}
                onChange={(e) => updateSetting('users', 'passwordMaxLength', parseInt(e.target.value))}
                className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              />
            </div>
          </div>

          {/* Session Timeout */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.users.sessionTimeout')}
            </label>
            <select
              value={settings.users.sessionTimeout}
              onChange={(e) => updateSetting('users', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <option value={1800000}>{t('settings.users.session30min')}</option>
              <option value={3600000}>{t('settings.users.session1hour')}</option>
              <option value={7200000}>{t('settings.users.session2hours')}</option>
              <option value={86400000}>{t('settings.users.session24hours')}</option>
              <option value={0}>{t('settings.users.sessionUnlimited')}</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('settings.users.sessionTimeoutHint')}
            </p>
          </div>

          {/* Toggles */}
          <div className="pt-4 border-t-[2px] border-gray-200">
            <ToggleSwitch
              label={t('settings.users.autoLogout')}
              description={t('settings.users.autoLogoutDesc')}
              checked={settings.users.autoLogoutInactive}
              onChange={(value) => updateSetting('users', 'autoLogoutInactive', value)}
              disabled={true}
            />
          </div>
        </div>
        </SettingsSection>

        {/* ========== 3. CONTENT SETTINGS ========== */}
        <SettingsSection
        title={t('settings.content.title')}
        icon="📚"
        description={t('settings.content.description')}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Quiz Time Limit */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.content.quizTimeLimit')}
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={settings.content.defaultQuizTimeLimit}
              onChange={(e) => updateSetting('content', 'defaultQuizTimeLimit', parseInt(e.target.value))}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('settings.content.quizTimeLimitHint')}
            </p>
          </div>

          {/* Passing Score */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.content.passingScore')}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.content.defaultPassingScore}
              onChange={(e) => updateSetting('content', 'defaultPassingScore', parseInt(e.target.value))}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 {t('settings.content.passingScoreHint')}
            </p>
          </div>

          {/* Max Retry Attempts */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.content.maxRetryAttempts')}
            </label>
            <select
              value={settings.content.maxRetryAttempts}
              onChange={(e) => updateSetting('content', 'maxRetryAttempts', parseInt(e.target.value) || -1)}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
              disabled={!settings.content.allowRetry}
            >
              <option value={1}>{t('settings.content.retry1')}</option>
              <option value={3}>{t('settings.content.retry3')}</option>
              <option value={5}>{t('settings.content.retry5')}</option>
              <option value={-1}>{t('settings.content.retryUnlimited')}</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t-[2px] border-gray-200">
            <ToggleSwitch
              label={t('settings.content.showAnswers')}
              description={t('settings.content.showAnswersDesc')}
              checked={settings.content.showAnswersAfterCompletion}
              onChange={(value) => updateSetting('content', 'showAnswersAfterCompletion', value)}
            />
            
            <ToggleSwitch
              label={t('settings.content.allowRetry')}
              description={t('settings.content.allowRetryDesc')}
              checked={settings.content.allowRetry}
              onChange={(value) => updateSetting('content', 'allowRetry', value)}
            />
          </div>
        </div>
        </SettingsSection>

        {/* ========== 4. SEED DATA SETTINGS ========== */}
        <SettingsSection
        title={t('settings.seed.title')}
        icon="🌱"
        description={t('settings.seed.description')}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Info */}
          <div className="p-4 bg-blue-50 border-[3px] border-blue-400 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">
              💡 <strong>{t('settings.seed.aboutTitle')}</strong>
            </p>
            <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
              <li>{t('settings.seed.about1')}</li>
              <li>{t('settings.seed.about2')}</li>
              <li>{t('settings.seed.about3')}</li>
            </ul>
          </div>

          {/* Current Status */}
          <div className="p-4 bg-gray-50 border-[2px] border-gray-300 rounded-lg">
            <p className="text-sm font-bold text-gray-700 mb-2">{t('settings.seed.currentStatus')}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.seed.demoUsers')}</span>
                <span className={`font-bold ${SEED_CONFIG.ENABLED ? 'text-green-600' : 'text-red-600'}`}>
                  {SEED_CONFIG.ENABLED ? t('settings.seed.enabled') : t('settings.seed.disabled')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.seed.autoSeed')}</span>
                <span className={`font-bold ${SEED_CONFIG.AUTO_SEED ? 'text-green-600' : 'text-gray-600'}`}>
                  {SEED_CONFIG.AUTO_SEED ? t('settings.seed.yes') : t('settings.seed.no')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.seed.keepAfterDelete')}</span>
                <span className={`font-bold ${SEED_CONFIG.KEEP_AFTER_DELETE ? 'text-yellow-600' : 'text-green-600'}`}>
                  {SEED_CONFIG.KEEP_AFTER_DELETE ? t('settings.seed.yes') : t('settings.seed.no')}
                </span>
              </div>
            </div>
          </div>

          {/* Seed Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                if (confirm(t('settings.seed.factoryResetConfirm'))) {
                  const result = resetToFactoryDefaults();
                  if (result.success) {
                    alert(t('settings.seed.factoryResetSuccess', { message: result.message }));
                    window.location.reload();
                  }
                }
              }}
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>{t('settings.seed.factoryReset')}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(t('settings.seed.clearBlacklistConfirm'))) {
                  clearDeletedUsers();
                  alert(t('settings.seed.clearBlacklistSuccess'));
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <span>🗑️</span>
              <span>{t('settings.seed.clearBlacklist')}</span>
            </button>
          </div>

          {/* Note */}
          <div className="p-3 bg-yellow-100 border-[2px] border-yellow-400 rounded">
            <p className="text-xs font-bold text-yellow-900">
              ⚠️ <strong>{t('settings.seed.note')}</strong> {t('settings.seed.noteText')}
            </p>
          </div>
        </div>
        </SettingsSection>

        {/* ========== STICKY SAVE BUTTON ========== */}
        <div className="sticky bottom-4 z-10 bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm">
              {hasChanges ? (
                <span className="font-bold text-orange-600">{t('settings.saveButton.hasChanges')}</span>
              ) : (
                <span className="font-semibold text-green-600">{t('settings.saveButton.allSaved')}</span>
              )}
            </div>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] font-black transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>💾</span>
              <span>{isSaving ? t('settings.saveButton.saving') : t('settings.saveButton.save')}</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

