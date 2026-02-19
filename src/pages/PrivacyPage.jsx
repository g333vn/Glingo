// src/pages/PrivacyPage.jsx
// Privacy Policy Page

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-40 h-40 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-1/3 right-20 w-40 h-40 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      {/* MAIN CONTAINER */}
      <div className="mx-auto bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden max-w-3xl border-2 border-white/50 relative z-0">
        {/* Header */}
        <div className="text-center pt-10 pb-6 px-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
            {t('legal.privacy.title')}
          </h1>
          <p className="text-gray-500 text-sm">
            {t('legal.privacy.lastUpdated')}: {t('legal.privacy.updateDate')}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 md:px-10 pb-10 space-y-8">
          
          {/* Intro */}
          <section>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.intro')}
            </p>
          </section>

          {/* Section 1: Data Collection */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">1.</span> {t('legal.privacy.collection.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {t('legal.privacy.collection.intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>{t('legal.privacy.collection.item1')}</li>
              <li>{t('legal.privacy.collection.item2')}</li>
              <li>{t('legal.privacy.collection.item3')}</li>
              <li>{t('legal.privacy.collection.item4')}</li>
            </ul>
          </section>

          {/* Section 2: Data Usage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">2.</span> {t('legal.privacy.usage.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {t('legal.privacy.usage.intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>{t('legal.privacy.usage.item1')}</li>
              <li>{t('legal.privacy.usage.item2')}</li>
              <li>{t('legal.privacy.usage.item3')}</li>
            </ul>
          </section>

          {/* Section 3: Data Storage */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">3.</span> {t('legal.privacy.storage.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.storage.content')}
            </p>
          </section>

          {/* Section 4: Third Party */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">4.</span> {t('legal.privacy.thirdParty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {t('legal.privacy.thirdParty.intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li><strong>Supabase</strong> - {t('legal.privacy.thirdParty.supabase')}</li>
              <li><strong>Vercel</strong> - {t('legal.privacy.thirdParty.vercel')}</li>
            </ul>
          </section>

          {/* Section 5: Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">5.</span> {t('legal.privacy.cookies.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.cookies.content')}
            </p>
          </section>

          {/* Section 6: User Rights */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">6.</span> {t('legal.privacy.rights.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
              {t('legal.privacy.rights.intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 ml-4">
              <li>{t('legal.privacy.rights.item1')}</li>
              <li>{t('legal.privacy.rights.item2')}</li>
              <li>{t('legal.privacy.rights.item3')}</li>
            </ul>
          </section>

          {/* Section 7: Security */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">7.</span> {t('legal.privacy.security.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.security.content')}
            </p>
          </section>

          {/* Section 8: Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">8.</span> {t('legal.privacy.changes.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.changes.content')}
            </p>
          </section>

          {/* Section 9: Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-orange-500">9.</span> {t('legal.privacy.contact.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('legal.privacy.contact.content')}
            </p>
          </section>

        </div>

        {/* Footer Links */}
        <div className="px-6 md:px-10 pb-10 text-center space-y-4">
          <Link 
            to="/terms" 
            className="inline-block text-orange-500 hover:text-orange-600 font-semibold transition-colors"
          >
            {t('legal.privacy.viewTerms')} →
          </Link>
          <div>
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← {t('legal.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

