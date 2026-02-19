// src/components/WarningModal.jsx
// NEO BRUTALISM MODAL - Ongoing Exam Warning

import React from 'react';
import Modal from './Modal.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

function WarningModal({ isOpen, onConfirm, onCancel }) {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={t('jlpt.modals.ongoingExamTitle')}
      maxWidth="36rem"
      closeOnEscape={true}
      closeOnClickOutside={true}
    >
      <div className="py-4">
        <p className="mb-3 text-base text-gray-800 font-semibold">
          {t('jlpt.modals.ongoingExamWarning')} <strong className="text-red-600 font-black">{t('jlpt.modals.ongoingExamWarningBold')}</strong> {t('jlpt.modals.ongoingExamWarningContinue')}
        </p>
        <p className="mb-3 text-base text-gray-800 font-semibold">
          {t('jlpt.modals.ongoingExamTip1')} <strong className="text-green-600 font-black">{t('jlpt.modals.ongoingExamTip1Bold')}</strong>{t('jlpt.modals.ongoingExamTip1Continue')}
        </p>
        <p className="mb-3 text-base text-gray-800 font-semibold">
          {t('jlpt.modals.ongoingExamTip2')} <strong className="text-blue-600 font-black">{t('jlpt.modals.ongoingExamTip2Bold')}</strong>{t('jlpt.modals.ongoingExamTip2Continue')}
        </p>
        <p className="text-red-600 font-black text-lg mt-6 mb-4">
          {t('jlpt.modals.ongoingExamQuestion')}
        </p>

        {/* NEO BRUTALISM BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-white text-black font-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.ongoingExamStay')}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-500 text-white font-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.modals.ongoingExamContinue')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default WarningModal;
