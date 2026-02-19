// src/components/admin/lessons/tabs/FlashcardTab.jsx
// Flashcard Tab - Quản lý SRS flashcard deck

import React, { useState } from 'react';
import FlashcardPreview from '../FlashcardPreview.jsx';
import FlashcardEditor from '../FlashcardEditor.jsx';
import BulkImportCSV from '../BulkImportCSV.jsx';
import PDFAutoExtract from '../PDFAutoExtract.jsx';

/**
 * FlashcardTab Component
 * Phase 1: Skeleton với basic settings 
 * Phase 2: Card editor + Bulk import 
 * Phase 2: Auto-extract từ PDF 
 * 
 * @param {object} srsData - SRS data from lesson
 * @param {function} onChange - Callback khi thay đổi
 * @param {string} lessonId - Lesson ID for deck reference
 * @param {string} pdfUrl - PDF URL from theory tab (for auto-extract)
 */
function FlashcardTab({ srsData, onChange, lessonId, pdfUrl }) {
  // ========== STATE ==========
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAutoExtract, setShowAutoExtract] = useState(false);

  /**
   * Handle field change
   */
  const handleChange = (field, value) => {
    onChange({
      ...srsData,
      [field]: value
    });
  };
  
  /**
   * Handle nested field change
   */
  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...srsData,
      [parent]: {
        ...srsData[parent],
        [field]: value
      }
    });
  };

  /**
   * Handle cards change from editor
   */
  const handleCardsChange = (newCards) => {
    onChange({
      ...srsData,
      cards: newCards,
      cardCount: newCards.length
    });
  };

  /**
   * Handle bulk import
   */
  const handleBulkImport = (importedCards) => {
    const currentCards = srsData.cards || [];
    const allCards = [...currentCards, ...importedCards];
    handleCardsChange(allCards);
    setShowBulkImport(false);
    alert(`✅ Imported ${importedCards.length} flashcards!`);
  };

  /**
   * Handle auto-extract
   */
  const handleAutoExtract = (extractedCards) => {
    const currentCards = srsData.cards || [];
    const allCards = [...currentCards, ...extractedCards];
    handleCardsChange(allCards);
    setShowAutoExtract(false);
    alert(`✅ Extracted ${extractedCards.length} flashcards from PDF!`);
  };
  
  return (
    <div className="space-y-6">
      {/* ========== SECTION: Enable SRS ========== */}
      <div className="p-4 bg-purple-50 border-[3px] border-purple-300 rounded-lg">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="enableSRS"
            checked={srsData.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
            className="w-6 h-6 rounded border-2 border-black cursor-pointer"
          />
          <label htmlFor="enableSRS" className="text-base font-black text-purple-900 cursor-pointer">
            🎴 Bật Flashcard SRS cho bài học này
          </label>
        </div>
        <p className="text-sm text-purple-700 mt-2 ml-9">
          Học viên sẽ có thể ôn từ vựng bằng hệ thống lặp lại ngắt quãng (Spaced Repetition)
        </p>
      </div>
      
      {!srsData.enabled ? (
        // ========== DISABLED STATE ========== */}
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎴</div>
          <p className="text-lg font-bold">Flashcard SRS chưa được bật</p>
          <p className="text-sm mt-2">Tích checkbox ở trên để kích hoạt</p>
        </div>
      ) : (
        // ========== ENABLED STATE ========== */}
        <>
          {/* ========== SECTION: Deck Info ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span>📦</span>
              Thông Tin Deck
            </h3>
            
            {/* Deck ID (auto-generated) */}
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
              <p className="text-xs font-bold text-gray-600 mb-1">Deck ID (tự động):</p>
              <code className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300 block">
                {srsData.deckId || `deck-${lessonId || 'auto'}`}
              </code>
            </div>
            
            {/* Card Count Display */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
                <p className="text-2xl font-black text-blue-600">{srsData.cardCount || 0}</p>
                <p className="text-xs font-bold text-blue-700">Tổng thẻ</p>
              </div>
              <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                <p className="text-2xl font-black text-green-600">{srsData.stats?.totalReviews || 0}</p>
                <p className="text-xs font-bold text-green-700">Lượt ôn</p>
              </div>
              <div className="p-3 bg-purple-50 border-2 border-purple-300 rounded-lg text-center">
                <p className="text-2xl font-black text-purple-600">
                  {srsData.stats?.retention ? `${Math.round(srsData.stats.retention * 100)}%` : 'N/A'}
                </p>
                <p className="text-xs font-bold text-purple-700">Retention</p>
              </div>
            </div>
          </div>
          
          {/* ========== SECTION: Settings ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span>⚙️</span>
              Cài Đặt SRS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Cards Per Day */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Thẻ mới mỗi ngày
                </label>
                <input
                  type="number"
                  value={srsData.newCardsPerDay || 20}
                  onChange={(e) => handleChange('newCardsPerDay', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <p className="text-xs text-gray-500 mt-1">Số thẻ mới học viên học mỗi ngày</p>
              </div>
              
              {/* Reviews Per Day */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔄 Ôn tập tối đa/ngày
                </label>
                <input
                  type="number"
                  value={srsData.reviewsPerDay || 100}
                  onChange={(e) => handleChange('reviewsPerDay', parseInt(e.target.value))}
                  min="10"
                  max="500"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <p className="text-xs text-gray-500 mt-1">Giới hạn số lượt ôn mỗi ngày</p>
              </div>
            </div>
          </div>
          
          {/* ========== SECTION: Flashcard Preview ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <span>🎴</span>
              Preview Flashcard
            </h3>
            
            {/* Interactive Preview */}
            <FlashcardPreview
              sampleCard={{
                front: '食べる',
                back: 'Ăn (to eat)',
                reading: 'たべる',
                example: 'りんごを食べます',
                exampleTranslation: 'Tôi ăn táo'
              }}
              onTest={(result) => {
                // Update stats demo
                handleNestedChange('stats', 'totalReviews', (srsData.stats?.totalReviews || 0) + 1);
              }}
            />
          </div>
          
          {/* ========== SECTION: Flashcard Management (Phase 2) ========== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <span>✏️</span>
                Quản Lý Flashcard
              </h3>
              
              {/* Toolbar */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImport(true)}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg border-2 border-black
                           font-bold text-sm hover:bg-purple-600 transition-colors
                           shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  📊 Import CSV
                </button>
                {pdfUrl && (
                  <button
                    type="button"
                    onClick={() => setShowAutoExtract(true)}
                    className="px-3 py-2 bg-teal-500 text-white rounded-lg border-2 border-black
                             font-bold text-sm hover:bg-teal-600 transition-colors
                             shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    🤖 Auto-Extract
                  </button>
                )}
              </div>
            </div>
            
            {/* Phase 2: Flashcard Editor */}
            <FlashcardEditor
              cards={srsData.cards || []}
              onChange={handleCardsChange}
              deckId={srsData.deckId || `deck-${lessonId}`}
            />
          </div>

          {/* ========== MODALS ========== */}
          {showBulkImport && (
            <BulkImportCSV
              onImport={handleBulkImport}
              onClose={() => setShowBulkImport(false)}
            />
          )}

          {showAutoExtract && (
            <PDFAutoExtract
              pdfUrl={pdfUrl}
              onExtractComplete={handleAutoExtract}
              onClose={() => setShowAutoExtract(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default FlashcardTab;

