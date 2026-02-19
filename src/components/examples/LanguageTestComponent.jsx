// src/components/examples/LanguageTestComponent.jsx
// Test Component for i18n System

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

/**
 * Test component to verify i18n system works correctly
 * Use this to debug translation issues
 */
function LanguageTestComponent() {
  const { t, currentLanguage, currentLangInfo, changeLanguage, languages } = useLanguage();
  
  const testKeys = [
    'common.home',
    'common.login',
    'common.logout',
    'lesson.title',
    'lesson.theory',
    'lesson.quiz',
    'quiz.question',
    'quiz.submit',
    'progress.completed',
    'admin.dashboard'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <h1 className="text-3xl font-black text-gray-800 mb-2">
            🧪 i18n Test Component
          </h1>
          <p className="text-gray-600">
            Test translation system with all languages
          </p>
        </div>
        
        {/* Current Language Info */}
        <div className="bg-yellow-100 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            📍 Current Language
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">Code</p>
              <p className="text-2xl font-black">{currentLanguage}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">Flag</p>
              <p className="text-4xl">{currentLangInfo.flag}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">Name</p>
              <p className="text-xl font-bold">{currentLangInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">Native</p>
              <p className="text-xl font-bold">{currentLangInfo.nativeName}</p>
            </div>
          </div>
        </div>
        
        {/* Language Switcher */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            🔄 Switch Language
          </h2>
          <div className="flex gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex-1 px-6 py-4 rounded-lg border-[3px] font-black transition-all duration-200 ${
                  currentLanguage === lang.code
                    ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className="text-3xl mb-2">{lang.flag}</div>
                <div className="text-sm">{lang.nativeName}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Translation Tests */}
        <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            📝 Translation Tests
          </h2>
          <div className="space-y-3">
            {testKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-[2px] border-gray-300"
              >
                <code className="text-xs font-mono text-gray-600 flex-1">
                  {key}
                </code>
                <div className="text-right flex-1">
                  <span className="text-lg font-bold text-gray-800">
                    {t(key)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Parameter Test */}
        <div className="bg-blue-100 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            🔢 Parameter Substitution Test
          </h2>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border-[2px] border-gray-300">
              <p className="text-xs font-mono text-gray-600 mb-2">
                {`t('header.streakDays', { count: 7 })`}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {t('header.streakDays', { count: 7 })}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border-[2px] border-gray-300">
              <p className="text-xs font-mono text-gray-600 mb-2">
                {`t('notification.streakUpdated', { count: 14 })`}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {t('notification.streakUpdated', { count: 14 })}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border-[2px] border-gray-300">
              <p className="text-xs font-mono text-gray-600 mb-2">
                {`t('search.resultsFound', { count: 42 })`}
              </p>
              <p className="text-lg font-bold text-gray-800">
                {t('search.resultsFound', { count: 42 })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Missing Key Test */}
        <div className="bg-red-100 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            ⚠️ Missing Key Test (Check Console)
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            This should show the key itself and log a warning in console:
          </p>
          <div className="p-3 bg-white rounded-lg border-[2px] border-gray-300">
            <p className="text-xs font-mono text-gray-600 mb-2">
              {`t('nonexistent.key.test')`}
            </p>
            <p className="text-lg font-bold text-red-600">
              {t('nonexistent.key.test')}
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Open DevTools Console to see warning message
          </p>
        </div>
        
        {/* All Languages Preview */}
        <div className="bg-green-100 rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-xl font-black text-gray-800 mb-4">
            🌐 All Languages Preview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className="p-4 bg-white rounded-lg border-[2px] border-gray-300"
              >
                <div className="text-2xl mb-2">{lang.flag}</div>
                <div className="text-sm font-bold text-gray-800 mb-3">
                  {lang.nativeName}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Home:</span>{' '}
                    <span className="font-bold">
                      {lang.code === 'vi' ? 'Trang chủ' : 
                       lang.code === 'en' ? 'Home' : 'ホーム'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Login:</span>{' '}
                    <span className="font-bold">
                      {lang.code === 'vi' ? 'Đăng nhập' : 
                       lang.code === 'en' ? 'Login' : 'ログイン'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lesson:</span>{' '}
                    <span className="font-bold">
                      {lang.code === 'vi' ? 'Bài học' : 
                       lang.code === 'en' ? 'Lesson' : 'レッスン'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-100 rounded-lg border-[3px] border-gray-400">
          <h3 className="font-black text-gray-800 mb-3">
            📖 How to Use This Test Component
          </h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Click on language buttons to switch languages</li>
            <li>Verify all translations change correctly</li>
            <li>Check that parameters are replaced properly</li>
            <li>Open DevTools Console to see debug warnings</li>
            <li>Test missing key handling (red section)</li>
            <li>Refresh page to test localStorage persistence</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-50 rounded border-[2px] border-yellow-300">
            <p className="text-xs text-yellow-800">
              <strong>💡 Tip:</strong> If translations don't change, check:
              <br />• Console for errors
              <br />• Translation files are imported correctly
              <br />• Keys exist in all language files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LanguageTestComponent;

