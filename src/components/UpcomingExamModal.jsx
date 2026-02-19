// src/components/UpcomingExamModal.jsx
// NEO BRUTALISM MODAL - "Đề thi đang chuẩn bị"

import React from 'react';
import Modal from './Modal.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

function UpcomingExamModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('jlpt.upcomingModal.title')}
      maxWidth="32rem"
      closeOnEscape={true}
      closeOnClickOutside={true}
    >
      <div className="py-4">
        <p className="text-base text-gray-800 font-semibold mb-4">
          {t('jlpt.upcomingModal.message')}
        </p>
        
        {/* NEO BRUTALISM BUTTON */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-500 text-white font-black rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 uppercase tracking-wide"
          >
            {t('jlpt.upcomingModal.action')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default UpcomingExamModal;

