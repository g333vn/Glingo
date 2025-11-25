// src/components/examples/DebugTranslationTest.jsx
// 🔍 Debug test để verify translation system hoạt động

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import translations from '../../translations/index.js';

function DebugTranslationTest() {
  const { t, currentLanguage, changeLanguage, currentLangInfo } = useLanguage();
  const [logs, setLogs] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };
  
  useEffect(() => {
    addLog(`Language changed to: ${currentLanguage}`);
    addLog(`Available translations: ${Object.keys(translations).join(', ')}`);
    addLog(`Current flag: ${currentLangInfo.flag}`);
  }, [currentLanguage, currentLangInfo]);
  
  const testTranslations = [
    'common.home',
    'common.login', 
    'lesson.title',
    'quiz.question',
    'nonexistent.key'
  ];
  
  const handleLanguageChange = (langCode) => {
    addLog(`Changing to ${langCode}...`);
    changeLanguage(langCode);
  };
  
  return (
    <div className="p-8 max-w-6xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-black mb-6 text-center">
        🔍 Debug Translation Test
      </h1>
      
      {/* Current Status */}
      <div className="mb-6 p-6 bg-blue-50 rounded-lg border-4 border-blue-500">
        <h2 className="text-xl font-bold mb-3">Current Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Language:</span> {currentLanguage}
          </div>
          <div>
            <span className="font-bold">Flag:</span> {currentLangInfo.flag}
          </div>
          <div>
            <span className="font-bold">Name:</span> {currentLangInfo.nativeName}
          </div>
          <div>
            <span className="font-bold">Available:</span> {Object.keys(translations).join(', ')}
          </div>
        </div>
      </div>
      
      {/* Language Buttons */}
      <div className="mb-6 p-6 bg-green-50 rounded-lg border-4 border-green-500">
        <h2 className="text-xl font-bold mb-3">Change Language</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleLanguageChange('vi')}
            className={`px-6 py-3 font-bold rounded-lg border-3 transition-all ${
              currentLanguage === 'vi' 
                ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-800 border-gray-300 hover:border-black'
            }`}
          >
            🇻🇳 Vietnamese
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-6 py-3 font-bold rounded-lg border-3 transition-all ${
              currentLanguage === 'en' 
                ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-800 border-gray-300 hover:border-black'
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => handleLanguageChange('ja')}
            className={`px-6 py-3 font-bold rounded-lg border-3 transition-all ${
              currentLanguage === 'ja' 
                ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-gray-800 border-gray-300 hover:border-black'
            }`}
          >
            🇯🇵 Japanese
          </button>
        </div>
      </div>
      
      {/* Translation Tests */}
      <div className="mb-6 p-6 bg-yellow-50 rounded-lg border-4 border-yellow-500">
        <h2 className="text-xl font-bold mb-3">Translation Tests</h2>
        <div className="space-y-3">
          {testTranslations.map(key => (
            <div key={key} className="flex items-center justify-between p-3 bg-white rounded border-2">
              <code className="font-mono text-sm text-gray-600">
                t('{key}')
              </code>
              <div className="text-right">
                <span className="text-lg font-bold">
                  "{t(key)}"
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Parameter Test */}
      <div className="mb-6 p-6 bg-purple-50 rounded-lg border-4 border-purple-500">
        <h2 className="text-xl font-bold mb-3">Parameter Tests</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border-2">
            <code className="font-mono text-sm text-gray-600">
              t('header.streakDays', {'{'} count: 7 {'}'})
            </code>
            <div className="text-right">
              <span className="text-lg font-bold">
                "{t('header.streakDays', { count: 7 })}"
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded border-2">
            <code className="font-mono text-sm text-gray-600">
              t('search.resultsFound', {'{'} count: 42 {'}'})
            </code>
            <div className="text-right">
              <span className="text-lg font-bold">
                "{t('search.resultsFound', { count: 42 })}"
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs */}
      <div className="p-6 bg-gray-50 rounded-lg border-4 border-gray-500">
        <h2 className="text-xl font-bold mb-3">Debug Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        <button
          onClick={() => setLogs([])}
          className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Logs
        </button>
      </div>
      
      {/* Raw Translation Data */}
      <div className="mt-6 p-6 bg-red-50 rounded-lg border-4 border-red-500">
        <h2 className="text-xl font-bold mb-3">Raw Translation Data</h2>
        <details className="cursor-pointer">
          <summary className="font-bold text-lg">Click to expand</summary>
          <pre className="mt-3 p-4 bg-white rounded text-xs overflow-auto border max-h-96">
            {JSON.stringify(translations, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default DebugTranslationTest;
