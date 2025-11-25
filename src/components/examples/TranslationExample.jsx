// src/components/examples/TranslationExample.jsx
// 📝 Example of using translations in components

import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

/**
 * This is an example component showing how to use translations
 * You can use this as a reference when implementing i18n in your components
 */
function TranslationExample() {
  const { t, currentLanguage, currentLangInfo, changeLanguage } = useLanguage();
  
  return (
    <div className="bg-white rounded-lg border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-800 mb-4">
        🌐 Translation Example
      </h1>
      
      {/* Example 1: Simple translation */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-[2px] border-blue-300">
        <h3 className="font-bold text-gray-800 mb-2">Example 1: Simple Translation</h3>
        <p className="text-sm text-gray-600 mb-2">Code:</p>
        <code className="block bg-gray-800 text-white p-2 rounded text-xs mb-2">
          {`{t('common.home')}`}
        </code>
        <p className="text-sm">
          <strong>Result:</strong> {t('common.home')}
        </p>
      </div>
      
      {/* Example 2: Translation with parameters */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border-[2px] border-green-300">
        <h3 className="font-bold text-gray-800 mb-2">Example 2: With Parameters</h3>
        <p className="text-sm text-gray-600 mb-2">Code:</p>
        <code className="block bg-gray-800 text-white p-2 rounded text-xs mb-2">
          {`{t('header.streakDays', { count: 7 })}`}
        </code>
        <p className="text-sm">
          <strong>Result:</strong> {t('header.streakDays', { count: 7 })}
        </p>
      </div>
      
      {/* Example 3: Multiple translations */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-[2px] border-yellow-300">
        <h3 className="font-bold text-gray-800 mb-2">Example 3: Button Group</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded border-[2px] border-black font-bold">
            {t('common.save')}
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded border-[2px] border-black font-bold">
            {t('common.cancel')}
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded border-[2px] border-black font-bold">
            {t('common.edit')}
          </button>
        </div>
      </div>
      
      {/* Example 4: Current language info */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg border-[2px] border-purple-300">
        <h3 className="font-bold text-gray-800 mb-2">Example 4: Language Info</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Current Language:</strong> {currentLanguage}</p>
          <p><strong>Flag:</strong> {currentLangInfo.flag}</p>
          <p><strong>Name:</strong> {currentLangInfo.name}</p>
          <p><strong>Native Name:</strong> {currentLangInfo.nativeName}</p>
        </div>
      </div>
      
      {/* Example 5: Manual language switch */}
      <div className="p-4 bg-red-50 rounded-lg border-[2px] border-red-300">
        <h3 className="font-bold text-gray-800 mb-2">Example 5: Programmatic Switch</h3>
        <p className="text-sm text-gray-600 mb-3">
          You can also change language programmatically:
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => changeLanguage('vi')}
            className="px-4 py-2 bg-white rounded border-[2px] border-black font-bold hover:bg-yellow-100 transition-colors"
          >
            🇻🇳 Vietnamese
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className="px-4 py-2 bg-white rounded border-[2px] border-black font-bold hover:bg-yellow-100 transition-colors"
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => changeLanguage('ja')}
            className="px-4 py-2 bg-white rounded border-[2px] border-black font-bold hover:bg-yellow-100 transition-colors"
          >
            🇯🇵 Japanese
          </button>
        </div>
      </div>
      
      {/* Usage tip */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border-[2px] border-gray-400">
        <p className="text-xs text-gray-700">
          <strong>💡 Tip:</strong> Always use the <code className="bg-gray-800 text-white px-1 rounded">t()</code> function 
          for any user-facing text to ensure proper internationalization.
        </p>
      </div>
    </div>
  );
}

export default TranslationExample;

