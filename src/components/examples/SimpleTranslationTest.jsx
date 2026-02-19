// src/components/examples/SimpleTranslationTest.jsx
// Simple test to verify translations are loaded

import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import translations from '../../translations/index.js';

function SimpleTranslationTest() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  
  useEffect(() => {
    console.log('=== TRANSLATION DEBUG ===');
    console.log('Current language:', currentLanguage);
    console.log('Available translations:', Object.keys(translations));
    console.log('vi translations:', translations.vi);
    console.log('en translations:', translations.en);
    console.log('ja translations:', translations.ja);
    console.log('Current translations:', translations[currentLanguage]);
    console.log('========================');
  }, [currentLanguage]);
  
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4">Simple Translation Test</h1>
      
      <div className="mb-4">
        <p>Current Language: <strong>{currentLanguage}</strong></p>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => changeLanguage('vi')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            🇻🇳 Vietnamese
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            🇬🇧 English
          </button>
          <button 
            onClick={() => changeLanguage('ja')}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            🇯🇵 Japanese
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>
          <code>t('common.home')</code>: <strong>{t('common.home')}</strong>
        </div>
        <div>
          <code>t('common.login')</code>: <strong>{t('common.login')}</strong>
        </div>
        <div>
          <code>t('lesson.title')</code>: <strong>{t('lesson.title')}</strong>
        </div>
        <div>
          <code>t('quiz.question')</code>: <strong>{t('quiz.question')}</strong>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Raw Translation Objects:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(translations, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default SimpleTranslationTest;

