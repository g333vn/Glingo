// src/components/admin/lessons/PDFAutoExtract.jsx
// 🤖 Auto-Extract from PDF - Extract flashcards từ PDF (Phase 2 - Optional)

import React, { useState } from 'react';

/**
 * PDFAutoExtract Component
 * Phase 2: Basic pattern-based extraction
 * Phase 3: OCR + AI-powered extraction
 * 
 * @param {string} pdfUrl - URL của PDF đã upload
 * @param {function} onExtractComplete - Callback khi extract xong (cards array)
 * @param {function} onClose - Callback khi đóng
 */
function PDFAutoExtract({ pdfUrl, onExtractComplete, onClose }) {
  // ========== STATE ==========
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedCards, setExtractedCards] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('pattern1');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // ========== PATTERNS ==========
  const patterns = {
    pattern1: {
      name: 'Pattern 1: Kanji【Reading】Meaning',
      example: '食べる【たべる】Ăn',
      regex: /([^\【]+)【([^\】]+)】(.+)/g,
      description: 'Kanji có furigana trong 【】'
    },
    pattern2: {
      name: 'Pattern 2: Kanji (romaji): English',
      example: '食べる (taberu): to eat',
      regex: /([^\(]+)\(([^\)]+)\):\s*(.+)/g,
      description: 'Kanji có romaji trong () và nghĩa sau :'
    },
    pattern3: {
      name: 'Pattern 3: Kanji - Meaning',
      example: '食べる - Ăn',
      regex: /([^\-]+)\s*-\s*(.+)/g,
      description: 'Kanji và nghĩa cách nhau bởi -'
    }
  };

  // ========== EXTRACTION LOGIC ==========
  const extractWithPattern = (text, patternKey) => {
    const pattern = patterns[patternKey];
    const regex = new RegExp(pattern.regex);
    const cards = [];
    let match;

    // Split by lines
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      regex.lastIndex = 0; // Reset regex
      match = regex.exec(line);

      if (match) {
        let card;
        
        if (patternKey === 'pattern1') {
          // Kanji【Reading】Meaning
          card = {
            id: `extracted-${Date.now()}-${index}`,
            front: match[1].trim(),
            reading: match[2].trim(),
            back: match[3].trim(),
            example: '',
            exampleTranslation: '',
            notes: `Auto-extracted (Pattern 1)`,
            tags: ['auto-extracted'],
            confidence: 0.9
          };
        } else if (patternKey === 'pattern2') {
          // Kanji (romaji): Meaning
          card = {
            id: `extracted-${Date.now()}-${index}`,
            front: match[1].trim(),
            reading: match[2].trim(),
            back: match[3].trim(),
            example: '',
            exampleTranslation: '',
            notes: `Auto-extracted (Pattern 2)`,
            tags: ['auto-extracted'],
            confidence: 0.85
          };
        } else if (patternKey === 'pattern3') {
          // Kanji - Meaning
          card = {
            id: `extracted-${Date.now()}-${index}`,
            front: match[1].trim(),
            reading: '',
            back: match[2].trim(),
            example: '',
            exampleTranslation: '',
            notes: `Auto-extracted (Pattern 3)`,
            tags: ['auto-extracted'],
            confidence: 0.7
          };
        }

        if (card && card.front && card.back) {
          cards.push(card);
        }
      }
    });

    return cards;
  };

  // ========== SIMULATE PDF EXTRACTION ==========
  /**
   * Simulate PDF text extraction
   * In production: Use pdf.js or backend service
   */
  const simulatePDFExtraction = async () => {
    return new Promise((resolve) => {
      // Simulate delay
      setTimeout(() => {
        // Sample text (in real app, this comes from PDF)
        const sampleText = `
食べる【たべる】Ăn
飲む【のむ】Uống
走る【はしる】Chạy
見る【みる】Nhìn
聞く【きく】Nghe
書く【かく】Viết
読む【よむ】Đọc
話す【はなす】Nói
        `.trim();
        resolve(sampleText);
      }, 1500);
    });
  };

  // ========== HANDLERS ==========
  const handleExtract = async () => {
    setIsExtracting(true);
    setProgress(0);

    try {
      // Step 1: Extract text from PDF (30%)
      setProgress(30);
      let text;
      
      if (showManualInput && manualText) {
        text = manualText;
      } else {
        text = await simulatePDFExtraction();
      }

      // Step 2: Apply pattern (60%)
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      const cards = extractWithPattern(text, selectedPattern);

      // Step 3: Done (100%)
      setProgress(100);
      setExtractedCards(cards);
      setIsExtracting(false);

      console.log('✅ Extracted:', cards.length, 'cards');
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      alert('Lỗi khi extract! Thử lại sau.');
      setIsExtracting(false);
    }
  };

  const handleImport = () => {
    if (extractedCards.length === 0) {
      alert('Không có thẻ nào để import!');
      return;
    }

    if (!confirm(`Import ${extractedCards.length} flashcards đã extract?`)) return;

    onExtractComplete(extractedCards);
    console.log('✅ Imported extracted cards:', extractedCards.length);
  };

  const handleRemoveCard = (cardId) => {
    setExtractedCards(extractedCards.filter(c => c.id !== cardId));
  };

  // ========== RENDER ==========
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-teal-500 border-b-[3px] border-black p-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>🤖</span>
              <span>Auto-Extract from PDF</span>
            </h3>
            <p className="text-sm text-green-100 mt-1">
              Trích xuất tự động flashcards từ PDF
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-white hover:text-red-300 transition-colors"
          >
            ✖️
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* PDF Info */}
          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-sm font-bold text-blue-900 mb-2">📄 PDF Source:</p>
            <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block">
              {pdfUrl || 'No PDF uploaded'}
            </code>
          </div>

          {/* Pattern Selection */}
          {!isExtracting && extractedCards.length === 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-black text-gray-800 mb-3">🎯 Chọn Pattern</h4>
                <div className="space-y-2">
                  {Object.entries(patterns).map(([key, pattern]) => (
                    <label
                      key={key}
                      className={`
                        block p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedPattern === key 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 bg-white hover:border-green-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="pattern"
                        value={key}
                        checked={selectedPattern === key}
                        onChange={(e) => setSelectedPattern(e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-bold text-gray-900">{pattern.name}</span>
                      <p className="text-xs text-gray-600 ml-7 mt-1">{pattern.description}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded ml-7 mt-1 inline-block">
                        {pattern.example}
                      </code>
                    </label>
                  ))}
                </div>
              </div>

              {/* Manual Input Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showManualInput}
                    onChange={(e) => setShowManualInput(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-black"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    📝 Nhập text thủ công (không dùng PDF)
                  </span>
                </label>

                {showManualInput && (
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full mt-3 px-4 py-3 border-2 border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-green-300 font-mono text-sm"
                    rows="8"
                    placeholder={`食べる【たべる】Ăn
飲む【のむ】Uống
走る【はしる】Chạy
...`}
                  />
                )}
              </div>

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={!pdfUrl && !manualText}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black
                         font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                         hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Bắt Đầu Extract
              </button>
            </div>
          )}

          {/* Extracting State */}
          {isExtracting && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-pulse">🤖</div>
              <p className="text-lg font-black text-gray-800 mb-3">Đang extract...</p>
              <div className="max-w-md mx-auto">
                <div className="w-full h-6 bg-gray-200 border-2 border-gray-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-teal-500 transition-all duration-500
                             flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${progress}%` }}
                  >
                    {progress > 10 && `${progress}%`}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {progress < 30 && 'Đang đọc PDF...'}
                  {progress >= 30 && progress < 60 && 'Đang phân tích pattern...'}
                  {progress >= 60 && progress < 100 && 'Đang tạo flashcards...'}
                  {progress === 100 && 'Hoàn thành!'}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {!isExtracting && extractedCards.length > 0 && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                  <p className="text-3xl font-black text-green-600">{extractedCards.length}</p>
                  <p className="text-xs font-bold text-green-700">Thẻ đã extract</p>
                </div>
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
                  <p className="text-3xl font-black text-blue-600">
                    {Math.round(extractedCards.reduce((sum, c) => sum + c.confidence, 0) / extractedCards.length * 100)}%
                  </p>
                  <p className="text-xs font-bold text-blue-700">Độ tin cậy TB</p>
                </div>
              </div>

              {/* Cards List */}
              <div>
                <h4 className="text-lg font-black text-gray-800 mb-3">
                  📋 Extracted Cards (Có thể chỉnh sửa trước khi import)
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {extractedCards.map((card, index) => (
                    <div
                      key={card.id}
                      className="p-3 bg-white border-2 border-gray-300 rounded-lg hover:border-green-400 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${card.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-600">
                              {Math.round(card.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-base font-black text-gray-900">
                            {card.front} → {card.back}
                          </p>
                          {card.reading && (
                            <p className="text-sm text-blue-600 font-mono">{card.reading}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setExtractedCards([])}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg border-2 border-black
                           font-bold hover:bg-gray-400 transition-colors"
                >
                  🔄 Extract lại
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black
                           font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  ✅ Import {extractedCards.length} cards
                </button>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm font-bold text-yellow-900 mb-2">💡 Lưu ý:</p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
              <li>Phase 2: Chỉ hỗ trợ pattern cơ bản (regex-based)</li>
              <li>Phase 3 sẽ có OCR + AI để extract chính xác hơn</li>
              <li>Nên kiểm tra kỹ cards trước khi import</li>
              <li>Có thể dùng Bulk Import CSV cho kết quả tốt hơn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFAutoExtract;

