// src/components/admin/lessons/BulkImportCSV.jsx
// 📊 Bulk Import CSV - Import nhiều flashcard từ CSV file

import React, { useState, useRef } from 'react';

/**
 * BulkImportCSV Component
 * Phase 2: Import flashcards from CSV with column mapping & validation
 * 
 * @param {function} onImport - Callback khi import xong (cards array)
 * @param {function} onClose - Callback khi đóng modal
 */
function BulkImportCSV({ onImport, onClose }) {
  // ========== STATE ==========
  const [step, setStep] = useState(1); // 1: Upload, 2: Map columns, 3: Preview
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    front: 0,
    back: 1,
    reading: 2,
    example: 3,
    exampleTranslation: 4,
    notes: 5,
    tags: 6
  });
  const [validCards, setValidCards] = useState([]);
  const [invalidCards, setInvalidCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // ========== CSV PARSER ==========
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      // Simple CSV parser (handles basic cases)
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    return { headers, rows };
  };

  // ========== AUTO-DETECT COLUMNS ==========
  const autoDetectColumns = (headers) => {
    const mapping = {};
    const keywords = {
      front: ['front', 'kanji', 'word', 'question', 'japanese', 'jp'],
      back: ['back', 'meaning', 'answer', 'vietnamese', 'vi', 'english', 'en'],
      reading: ['reading', 'hiragana', 'romaji', 'pronunciation', 'furigana'],
      example: ['example', 'sentence', 'usage'],
      exampleTranslation: ['translation', 'example_translation', 'sentence_translation'],
      notes: ['notes', 'note', 'memo', 'comment'],
      tags: ['tags', 'tag', 'category', 'label']
    };

    headers.forEach((header, index) => {
      const lower = header.toLowerCase();
      Object.entries(keywords).forEach(([field, keys]) => {
        if (keys.some(key => lower.includes(key))) {
          mapping[field] = index;
        }
      });
    });

    return mapping;
  };

  // ========== VALIDATE & CONVERT ==========
  const validateAndConvert = (rows, mapping) => {
    const valid = [];
    const invalid = [];

    rows.forEach((row, rowIndex) => {
      const card = {
        id: `imported-${Date.now()}-${rowIndex}`,
        front: row[mapping.front]?.trim() || '',
        back: row[mapping.back]?.trim() || '',
        reading: row[mapping.reading]?.trim() || '',
        example: row[mapping.example]?.trim() || '',
        exampleTranslation: row[mapping.exampleTranslation]?.trim() || '',
        notes: row[mapping.notes]?.trim() || '',
        tags: row[mapping.tags]?.split(/[,;]/).map(t => t.trim()).filter(Boolean) || [],
        createdAt: new Date().toISOString(),
        importedFrom: 'csv'
      };

      // Validation: front và back bắt buộc
      if (!card.front || !card.back) {
        invalid.push({
          rowIndex: rowIndex + 2, // +2 for header + 0-indexed
          card,
          error: 'Thiếu Front hoặc Back'
        });
      } else {
        valid.push(card);
      }
    });

    return { valid, invalid };
  };

  // ========== HANDLERS ==========
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      alert('Vui lòng chọn file CSV!');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0 || rows.length === 0) {
        alert('File CSV rỗng hoặc không đúng định dạng!');
        setIsProcessing(false);
        return;
      }

      setCsvData(rows);
      setHeaders(headers);
      
      // Auto-detect columns
      const detected = autoDetectColumns(headers);
      setColumnMapping({ ...columnMapping, ...detected });

      setIsProcessing(false);
      setStep(2);
      console.log('✅ CSV parsed:', { headers, rowCount: rows.length });
    };

    reader.onerror = () => {
      alert('Lỗi đọc file!');
      setIsProcessing(false);
    };

    reader.readAsText(selectedFile);
  };

  const handleColumnChange = (field, columnIndex) => {
    setColumnMapping({ ...columnMapping, [field]: parseInt(columnIndex) });
  };

  const handlePreview = () => {
    const { valid, invalid } = validateAndConvert(csvData, columnMapping);
    setValidCards(valid);
    setInvalidCards(invalid);
    setStep(3);
    console.log('📊 Validation:', { valid: valid.length, invalid: invalid.length });
  };

  const handleImport = () => {
    if (validCards.length === 0) {
      alert('Không có thẻ hợp lệ để import!');
      return;
    }

    if (!confirm(`Import ${validCards.length} flashcards?`)) return;

    onImport(validCards);
    console.log('✅ Imported:', validCards.length, 'cards');
  };

  // ========== RENDER ==========
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 border-b-[3px] border-black p-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>📊</span>
              <span>Bulk Import CSV</span>
            </h3>
            <p className="text-sm text-purple-100 mt-1">
              Bước {step}/3: {step === 1 ? 'Upload' : step === 2 ? 'Map Columns' : 'Preview & Import'}
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
        <div className="p-6">
          {/* ========== STEP 1: UPLOAD ========== */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h4 className="text-lg font-black text-gray-800 mb-2">📤 Upload CSV File</h4>
                <p className="text-sm text-gray-600">
                  File CSV phải có ít nhất 2 cột: Front và Back
                </p>
              </div>

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-12 border-[3px] border-dashed border-gray-400 rounded-lg
                         bg-gray-50 hover:bg-blue-50 hover:border-blue-400
                         cursor-pointer transition-all text-center"
              >
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-bold text-gray-700 mb-2">
                  Click để chọn file CSV
                </p>
                <p className="text-sm text-gray-500">
                  Hoặc kéo & thả file vào đây
                </p>
                {file && (
                  <p className="text-sm text-green-600 font-bold mt-4">
                    ✅ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {/* CSV Format Guide */}
              <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <p className="text-sm font-bold text-blue-900 mb-2">📋 Định dạng CSV mẫu:</p>
                <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto">
{`front,back,reading,example,tags
食べる,Ăn,たべる,りんごを食べます,"verb,food"
飲む,Uống,のむ,水を飲みます,"verb,drink"
走る,Chạy,はしる,速く走ります,"verb,movement"`}
                </pre>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Cột bắt buộc: <strong>front, back</strong> • Cột tùy chọn: reading, example, tags, notes
                </p>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin text-4xl">⏳</div>
                  <p className="text-sm text-gray-600 mt-2">Đang xử lý...</p>
                </div>
              )}
            </div>
          )}

          {/* ========== STEP 2: MAP COLUMNS ========== */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h4 className="text-lg font-black text-gray-800 mb-2">🗺️ Map Columns</h4>
                <p className="text-sm text-gray-600">
                  Kết nối cột CSV với field flashcard
                </p>
              </div>

              {/* Detected Info */}
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-sm font-bold text-green-900">
                  ✅ Phát hiện {csvData.length} dòng, {headers.length} cột
                </p>
              </div>

              {/* Column Mapping */}
              <div className="space-y-3">
                {Object.entries({
                  front: { label: 'Front (Mặt trước)', required: true },
                  back: { label: 'Back (Mặt sau)', required: true },
                  reading: { label: 'Reading (Cách đọc)', required: false },
                  example: { label: 'Example (Ví dụ)', required: false },
                  exampleTranslation: { label: 'Example Translation', required: false },
                  notes: { label: 'Notes (Ghi chú)', required: false },
                  tags: { label: 'Tags (Nhãn)', required: false }
                }).map(([field, config]) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="w-48 text-sm font-bold text-gray-700">
                      {config.label}
                      {config.required && <span className="text-red-500"> *</span>}
                    </label>
                    <select
                      value={columnMapping[field] ?? ''}
                      onChange={(e) => handleColumnChange(field, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">-- Không chọn --</option>
                      {headers.map((header, index) => (
                        <option key={index} value={index}>
                          Cột {index + 1}: {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg border-2 border-black
                           font-bold hover:bg-gray-400 transition-colors"
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handlePreview}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg border-[3px] border-black
                           font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all"
                >
                  Tiếp theo →
                </button>
              </div>
            </div>
          )}

          {/* ========== STEP 3: PREVIEW ========== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h4 className="text-lg font-black text-gray-800 mb-2">👁️ Preview & Import</h4>
                <p className="text-sm text-gray-600">
                  Kiểm tra dữ liệu trước khi import
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
                  <p className="text-3xl font-black text-blue-600">{csvData.length}</p>
                  <p className="text-xs font-bold text-blue-700">Tổng dòng</p>
                </div>
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center">
                  <p className="text-3xl font-black text-green-600">{validCards.length}</p>
                  <p className="text-xs font-bold text-green-700">Hợp lệ</p>
                </div>
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-center">
                  <p className="text-3xl font-black text-red-600">{invalidCards.length}</p>
                  <p className="text-xs font-bold text-red-700">Lỗi</p>
                </div>
              </div>

              {/* Valid Cards Preview */}
              {validCards.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-green-900">
                    ✅ Cards hợp lệ (hiển thị 5/{validCards.length}):
                  </h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {validCards.slice(0, 5).map((card, i) => (
                      <div key={i} className="p-3 bg-green-50 border-2 border-green-300 rounded">
                        <p className="text-sm font-bold text-gray-900">
                          {card.front} → {card.back}
                        </p>
                        {card.reading && (
                          <p className="text-xs text-gray-600 font-mono">{card.reading}</p>
                        )}
                        {card.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {card.tags.map((tag, j) => (
                              <span key={j} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid Cards */}
              {invalidCards.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-red-900">
                    ⚠️ Cards lỗi (sẽ bỏ qua):
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {invalidCards.map((item, i) => (
                      <div key={i} className="p-2 bg-red-50 border-2 border-red-300 rounded">
                        <p className="text-xs text-red-800">
                          <strong>Dòng {item.rowIndex}:</strong> {item.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg border-2 border-black
                           font-bold hover:bg-gray-400 transition-colors"
                >
                  ← Quay lại
                </button>
                <button
                  onClick={handleImport}
                  disabled={validCards.length === 0}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg border-[3px] border-black
                           font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Import {validCards.length} cards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkImportCSV;

