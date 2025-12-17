// src/pages/admin/SettingsPage.jsx
// ⚙️ SYSTEM SETTINGS PAGE - PHASE 1
// ✨ NEO BRUTALISM DESIGN

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { getSettings, saveSettings, resetSettings, exportSettings, importSettings, loadSettingsFromSupabase } from '../../utils/settingsManager.js';
import { setGlobalMaintenanceMode, saveSystemSettingsToSupabase, saveUserSettingsToSupabase } from '../../services/appSettingsService.js';
import { resetToFactoryDefaults } from '../../utils/seedManager.js';
import { clearDeletedUsers } from '../../data/users.js';
import { SEED_CONFIG } from '../../data/seedData.js';
import ToggleSwitch from '../../components/settings/ToggleSwitch.jsx';
import SettingsSection from '../../components/settings/SettingsSection.jsx';
// 🔒 SECURITY: Import error handler
import { getErrorMessage } from '../../utils/uiErrorHandler.js';

function SettingsPage() {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [settings, setSettings] = useState(getSettings());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [platformDescriptionInput, setPlatformDescriptionInput] = useState('');

  // Load settings on mount - ✅ Load from Supabase first
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // ✅ Load from Supabase first to get latest data
        const loadedSettings = await loadSettingsFromSupabase();
        setSettings(loadedSettings);
        
        // Initialize platformDescriptionInput from current settings
        const desc = loadedSettings.system.platformDescription;
        if (typeof desc === 'object' && desc !== null) {
          // Get text from current language or fallback to vi
          setPlatformDescriptionInput(desc[currentLanguage] || desc.vi || desc.en || desc.ja || '');
        } else if (typeof desc === 'string') {
          setPlatformDescriptionInput(desc);
        }
      } catch (error) {
        console.error('[SettingsPage] Error loading settings:', error);
        // Fallback to localStorage
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
        const desc = loadedSettings.system.platformDescription;
        if (typeof desc === 'object' && desc !== null) {
          setPlatformDescriptionInput(desc[currentLanguage] || desc.vi || desc.en || desc.ja || '');
        } else if (typeof desc === 'string') {
          setPlatformDescriptionInput(desc);
        }
      }
    };
    
    loadSettings();
  }, [currentLanguage]);

  // Update setting helper
  const updateSetting = async (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);

    // ✅ FIXED: If updating maintenanceMode, also update Supabase immediately
    if (category === 'system' && key === 'maintenanceMode') {
      try {
        const { success, error } = await setGlobalMaintenanceMode(value);
        if (success) {
          console.log('[SettingsPage] ✅ Updated global maintenance_mode to', value);
        } else {
          console.warn('[SettingsPage] ⚠️ Failed to update global maintenance_mode:', error);
        }
      } catch (err) {
        console.error('[SettingsPage] ❌ Error updating global maintenance_mode:', err);
      }
    }
  };

  // Translate text using Google Translate API
  const translateText = async (text, targetLang, sourceLang = 'auto') => {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return text;
    }

    if (sourceLang !== 'auto' && targetLang === sourceLang) {
      return text;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }

      return text;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`[Translate] Timeout translating to ${targetLang}`);
      } else {
        console.warn(`[Translate] Error translating to ${targetLang}:`, error);
      }
      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Auto-translate platformDescription if input has changed
      let finalSettings = { ...settings };
      
      if (platformDescriptionInput.trim()) {
        // Detect source language
        let sourceLang = 'auto';
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(platformDescriptionInput)) {
          sourceLang = 'ja';
        } else if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(platformDescriptionInput)) {
          sourceLang = 'vi';
        } else {
          sourceLang = 'en';
        }

        // Translate to all 3 languages
        const [viText, enText, jaText] = await Promise.all([
          sourceLang === 'vi' ? Promise.resolve(platformDescriptionInput) : translateText(platformDescriptionInput, 'vi', sourceLang),
          sourceLang === 'en' ? Promise.resolve(platformDescriptionInput) : translateText(platformDescriptionInput, 'en', sourceLang),
          sourceLang === 'ja' ? Promise.resolve(platformDescriptionInput) : translateText(platformDescriptionInput, 'ja', sourceLang)
        ]);

        finalSettings.system.platformDescription = {
          vi: viText || platformDescriptionInput,
          en: enText || platformDescriptionInput,
          ja: jaText || platformDescriptionInput
        };
        
        console.log('[Settings] Platform Description saved:', finalSettings.system.platformDescription);
      } else {
        // If input is empty, keep existing description or set to empty object
        if (!finalSettings.system.platformDescription || typeof finalSettings.system.platformDescription !== 'object') {
          finalSettings.system.platformDescription = { vi: '', en: '', ja: '' };
        }
      }

      // Save to localStorage first
      const success = saveSettings(finalSettings);
      
      if (success) {
        // ✅ Save system settings to Supabase for real-time sync
        const systemSettingsToSave = {
          platformName: finalSettings.system.platformName,
          platformTagline: finalSettings.system.platformTagline,
          platformDescription: finalSettings.system.platformDescription,
          contactEmail: finalSettings.system.contactEmail
        };

        // ✅ Save user settings to Supabase for real-time sync
        const userSettingsToSave = {
          defaultRole: finalSettings.users.defaultRole,
          passwordMinLength: finalSettings.users.passwordMinLength,
          passwordMaxLength: finalSettings.users.passwordMaxLength
        };

        // Variables to track save results
        let systemResult = { success: false };
        let userResult = { success: false };
        
        try {
          // Save both system and user settings to Supabase
          [systemResult, userResult] = await Promise.all([
            saveSystemSettingsToSupabase(systemSettingsToSave),
            saveUserSettingsToSupabase(userSettingsToSave)
          ]);
          
          const systemSuccess = systemResult.success;
          const userSuccess = userResult.success;
          
          if (systemSuccess && userSuccess) {
            console.log('[SettingsPage] ✅ Saved system and user settings to Supabase');
            // Trigger settings update event to notify other components
            window.dispatchEvent(new CustomEvent('settingsUpdated', { 
              detail: finalSettings 
            }));
          } else {
            const errors = [];
            if (!systemSuccess) errors.push('system settings');
            if (!userSuccess) errors.push('user settings');
            console.warn('[SettingsPage] ⚠️ Failed to save some settings to Supabase:', errors);
            // Continue anyway - localStorage is saved
          }
        } catch (err) {
          console.error('[SettingsPage] ❌ Error saving to Supabase:', err);
          // Continue anyway - localStorage is saved
        }

        setSettings(finalSettings);
        setHasChanges(false);
        
        // Set success message only if both saves succeeded, otherwise show warning
        const systemSuccess = systemResult.success;
        const userSuccess = userResult.success;
        if (systemSuccess && userSuccess) {
          setSaveMessage({ type: 'success', text: t('settings.messages.saveSuccess') });
        } else {
          const errors = [];
          if (!systemSuccess) errors.push('system settings');
          if (!userSuccess) errors.push('user settings');
          setSaveMessage({ 
            type: 'warning', 
            text: `${t('settings.messages.saveSuccess')} (⚠️ Supabase sync failed for: ${errors.join(', ')} - saved locally only)` 
          });
        }
        
        // Auto-hide message after 3s
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: t('settings.messages.saveError') });
      }
    } catch (error) {
      console.error('[SETTINGS] Save error:', error);
      setSaveMessage({ type: 'error', text: t('settings.messages.saveErrorDetail', { error: getErrorMessage(error, 'Save Settings') }) });
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
      setSaveMessage({ type: 'error', text: t('settings.messages.exportError', { error: getErrorMessage(error, 'Export Settings') }) });
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

          {/* Platform Description - Single input with auto-translation */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.system.platformDescription')} <span className="text-xs text-gray-500 normal-case">(🇻🇳 🇬🇧 🇯🇵 Auto-translate)</span>
            </label>
            <textarea
              value={platformDescriptionInput}
              onChange={(e) => {
                setPlatformDescriptionInput(e.target.value);
                setHasChanges(true);
              }}
              rows={4}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] resize-y"
              placeholder={currentLanguage === 'vi' 
                ? 'Nhập mô tả platform (sẽ tự động dịch sang 3 ngôn ngữ khi lưu)...'
                : currentLanguage === 'ja'
                ? 'プラットフォームの説明を入力（保存時に3言語に自動翻訳されます）...'
                : 'Enter platform description (will auto-translate to 3 languages on save)...'}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Nhập text một lần, hệ thống sẽ tự động dịch sang 3 ngôn ngữ (🇻🇳 🇬🇧 🇯🇵) khi bạn lưu cài đặt
            </p>
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

          {/* (Session timeout & auto-logout settings were removed as not needed in current version) */}
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
          {/* Max Retry Attempts */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              {t('settings.content.maxRetryAttempts')}
            </label>
            <select
              value={settings.content.maxRetryAttempts}
              onChange={(e) => updateSetting('content', 'maxRetryAttempts', parseInt(e.target.value))}
              className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <option value={1}>{t('settings.content.retry1')}</option>
              <option value={3}>{t('settings.content.retry3')}</option>
              <option value={5}>{t('settings.content.retry5')}</option>
              <option value={-1}>{t('settings.content.retryUnlimited')}</option>
              <option value={0}>{t('settings.content.retryNoRetry')}</option>
              <option value={-2}>{t('settings.content.retryCustom')}</option>
            </select>
            {settings.content.maxRetryAttempts === -2 && (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.content.maxRetryAttemptsCustom || 1}
                  onChange={(e) => updateSetting('content', 'maxRetryAttemptsCustom', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border-[3px] border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-black transition-all bg-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 {t('settings.content.retryCustomHint') || 'Nhập số lần tối đa cho phép (tối đa khuyến nghị: 50 lần).'} 
                </p>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4 border-t-[2px] border-gray-200">
            <ToggleSwitch
              label={t('settings.content.showAnswers')}
              description={t('settings.content.showAnswersDesc')}
              checked={settings.content.showAnswersAfterCompletion}
              onChange={(value) => updateSetting('content', 'showAnswersAfterCompletion', value)}
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

