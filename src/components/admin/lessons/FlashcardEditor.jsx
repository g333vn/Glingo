// src/components/admin/lessons/FlashcardEditor.jsx
// Flashcard Editor - CRUD operations cho flashcards

import React, { useState, useRef, useEffect } from 'react';

/**
 * FlashcardEditor Component
 * Phase 2: Full CRUD for flashcards
 * 
 * @param {array} cards - Array of flashcard objects
 * @param {function} onChange - Callback khi cards thay đổi
 * @param {string} deckId - Deck ID for reference
 */
function FlashcardEditor({ cards = [], onChange, deckId }) {
  // ========== STATE ==========
  const [editingCard, setEditingCard] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [showPreview, setShowPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);
  const cardsPerPage = 10;

  // ========== HELPERS ==========
  const generateCardId = () => `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const emptyCard = {
    id: '',
    front: '',
    back: '',
    reading: '',
    example: '',
    exampleTranslation: '',
    audio: '',
    image: '',
    notes: '',
    tags: []
  };

  // ========== FILTERING ==========
  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.front?.toLowerCase().includes(query) ||
      card.back?.toLowerCase().includes(query) ||
      card.reading?.toLowerCase().includes(query) ||
      card.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + cardsPerPage);

  // ========== CRUD OPERATIONS ==========
  const handleAddCard = (newCard) => {
    const card = {
      ...newCard,
      id: generateCardId(),
      createdAt: new Date().toISOString()
    };
    onChange([...cards, card]);
    // Don't close modal - let user continue adding more cards
    // setShowAddModal(false);
    console.log('✅ Added card:', card);
    
    // Show success message but keep modal open
    // User can click X or Cancel to close when done
  };

  const handleEditCard = (updatedCard) => {
    const updated = cards.map(card => 
      card.id === updatedCard.id ? { ...updatedCard, updatedAt: new Date().toISOString() } : card
    );
    onChange(updated);
    setEditingCard(null);
    console.log('✅ Updated card:', updatedCard);
  };

  const handleDeleteCard = (cardId) => {
    if (!confirm('Xóa flashcard này?')) return;
    const updated = cards.filter(card => card.id !== cardId);
    onChange(updated);
    console.log('🗑️ Deleted card:', cardId);
  };

  const handleDuplicateCard = (card) => {
    const duplicate = {
      ...card,
      id: generateCardId(),
      front: card.front + ' (Copy)',
      createdAt: new Date().toISOString()
    };
    onChange([...cards, duplicate]);
    console.log('📋 Duplicated card:', duplicate);
  };

  // ========== BULK OPERATIONS ==========
  const handleSelectCard = (cardId) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCards.size === paginatedCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(paginatedCards.map(c => c.id)));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Xóa ${selectedCards.size} flashcards đã chọn?`)) return;
    const updated = cards.filter(card => !selectedCards.has(card.id));
    onChange(updated);
    setSelectedCards(new Set());
    console.log('🗑️ Bulk deleted:', selectedCards.size, 'cards');
  };

  // ========== DRAG & DROP OPERATIONS ==========
  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    // Make the dragged item slightly transparent
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleDragOver = (e, cardId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedCardId && draggedCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCardId(null);
  };

  const handleDrop = (e, targetCardId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedCardId || draggedCardId === targetCardId) {
      setDragOverCardId(null);
      return;
    }

    // Find indices in the original cards array
    const draggedIndex = cards.findIndex(c => c.id === draggedCardId);
    const targetIndex = cards.findIndex(c => c.id === targetCardId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new array with reordered cards
    const newCards = [...cards];
    const [draggedCard] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCard);

    onChange(newCards);
    setDragOverCardId(null);
    console.log('🔄 Reordered cards:', { from: draggedIndex, to: targetIndex });
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-4">
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <span>✏️</span>
            <span>Flashcard Editor</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {cards.length} thẻ • Deck: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{deckId}</code>
          </p>
          <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
            <span>💡</span>
            <span>Kéo thả thẻ để sắp xếp lại thứ tự</span>
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg border-[3px] border-black
                   font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                   hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                   transition-all"
        >
          ➕ Thêm Thẻ Mới
        </button>
      </div>

      {/* ========== TOOLBAR ========== */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Tìm kiếm (front, back, reading, tags...)"
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Bulk Actions */}
        {selectedCards.size > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg border-2 border-black
                       font-bold hover:bg-red-600 transition-colors"
            >
              🗑️ Xóa ({selectedCards.size})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCards(new Set())}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg border-2 border-black
                       font-bold hover:bg-gray-600 transition-colors"
            >
              ✖️ Bỏ chọn
            </button>
          </div>
        )}
      </div>

      {/* ========== CARDS LIST ========== */}
      {paginatedCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border-2 border-gray-300 rounded-lg">
          <div className="text-6xl mb-4">🎴</div>
          <p className="text-lg font-bold text-gray-600">
            {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có flashcard nào'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {searchQuery ? 'Thử từ khóa khác' : 'Nhấn "Thêm Thẻ Mới" để bắt đầu'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select All */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={selectedCards.size === paginatedCards.length && paginatedCards.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-2 border-black cursor-pointer"
            />
            <span className="text-sm font-bold text-gray-700">Chọn tất cả ({paginatedCards.length})</span>
          </div>

          {/* Card Items */}
          {paginatedCards.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              index={startIndex + index + 1}
              isSelected={selectedCards.has(card.id)}
              isDragging={draggedCardId === card.id}
              isDragOver={dragOverCardId === card.id}
              onSelect={() => handleSelectCard(card.id)}
              onEdit={() => setEditingCard(card)}
              onDelete={() => handleDeleteCard(card.id)}
              onDuplicate={() => handleDuplicateCard(card)}
              onPreview={() => setShowPreview(card)}
              onDragStart={(e) => handleDragStart(e, card.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, card.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, card.id)}
            />
          ))}
        </div>
      )}

      {/* ========== PAGINATION ========== */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border-2 border-gray-300 rounded font-bold
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            ← Trước
          </button>
          
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border-2 rounded font-bold transition-colors
                    ${currentPage === page 
                      ? 'bg-blue-500 text-white border-black' 
                      : 'bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border-2 border-gray-300 rounded font-bold
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Sau →
          </button>
        </div>
      )}

      {/* ========== MODALS ========== */}
      {showAddModal && (
        <CardFormModal
          card={emptyCard}
          onSave={handleAddCard}
          onClose={() => setShowAddModal(false)}
          title="➕ Thêm Flashcard Mới"
        />
      )}

      {editingCard && (
        <CardFormModal
          card={editingCard}
          onSave={handleEditCard}
          onClose={() => setEditingCard(null)}
          title="✏️ Chỉnh Sửa Flashcard"
        />
      )}

      {showPreview && (
        <CardPreviewModal
          card={showPreview}
          onClose={() => setShowPreview(null)}
        />
      )}
    </div>
  );
}

// ========== CARD ITEM COMPONENT ==========
function CardItem({ 
  card, 
  index, 
  isSelected, 
  isDragging, 
  isDragOver, 
  onSelect, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPreview,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`
        p-4 border-2 rounded-lg transition-all cursor-move
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'border-green-500 border-[3px] bg-green-50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex flex-col items-center gap-1 mt-1 cursor-move">
          <div className="text-gray-400 hover:text-gray-600 text-lg">
            ⋮⋮
          </div>
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded border-2 border-black cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-600">#{index}</p>
              <p className="text-lg font-black text-gray-900 truncate">{card.front}</p>
              <p className="text-sm text-gray-700">{card.back}</p>
              {card.reading && (
                <p className="text-sm text-blue-600 font-mono">{card.reading}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-bold">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPreview}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold hover:bg-blue-200"
            >
              👁️ Preview
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-bold hover:bg-yellow-200"
            >
              ✏️ Sửa
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-bold hover:bg-green-200"
            >
              📋 Copy
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-bold hover:bg-red-200"
            >
              🗑️ Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== CARD FORM MODAL ==========
function CardFormModal({ card, onSave, onClose, title }) {
  // Define empty card structure
  const emptyCard = {
    id: '',
    front: '',
    back: '',
    reading: '',
    example: '',
    exampleTranslation: '',
    audio: '',
    image: '',
    notes: '',
    tags: []
  };
  
  const isEditingExisting = Boolean(card?.id);
  const initialData = isEditingExisting ? { ...card } : { ...emptyCard, ...card };
  
  const [formData, setFormData] = useState(initialData);
  const [tagInput, setTagInput] = useState('');
  const frontInputRef = useRef(null);
  
  useEffect(() => {
    const refreshedData = isEditingExisting ? { ...card } : { ...emptyCard, ...card };
    setFormData(refreshedData);
    setTagInput('');
  }, [card, isEditingExisting]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const tags = formData.tags || [];
    handleChange('tags', [...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (index) => {
    const tags = [...formData.tags];
    tags.splice(index, 1);
    handleChange('tags', tags);
  };

  const handleSubmit = (e, { closeAfterSave = false } = {}) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
      }
    }
    
    if (!formData.front || !formData.back) {
      alert('Vui lòng điền Front và Back!');
      return;
    }
    
    onSave(formData);
    
    if (closeAfterSave || isEditingExisting) {
      onClose();
      return;
    }
    
    const blankCard = { ...emptyCard };
    setFormData(blankCard);
    setTagInput('');
    
    setTimeout(() => {
      if (frontInputRef.current) {
        frontInputRef.current.focus();
      }
    }, 50);
  };

  // Prevent click on overlay from closing parent modal
  const handleOverlayClick = (e) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-[3px] border-black p-4 flex items-center justify-between">
          <h3 className="text-xl font-black">{title}</h3>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-600 transition-colors"
          >
            ✖️
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={(e) => handleSubmit(e, { closeAfterSave: false })} 
          className="p-6 space-y-4"
        >
          {/* Front */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📝 Front (Mặt trước) *
            </label>
            <input
              type="text"
              value={formData.front}
              onChange={(e) => handleChange('front', e.target.value)}
              ref={frontInputRef}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="食べる"
              required
            />
          </div>

          {/* Back */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📝 Back (Mặt sau) *
            </label>
            <input
              type="text"
              value={formData.back}
              onChange={(e) => handleChange('back', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Ăn (to eat)"
              required
            />
          </div>

          {/* Reading */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🔤 Reading (Cách đọc)
            </label>
            <input
              type="text"
              value={formData.reading || ''}
              onChange={(e) => handleChange('reading', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="たべる"
            />
          </div>

          {/* Example */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              💬 Example (Ví dụ)
            </label>
            <input
              type="text"
              value={formData.example || ''}
              onChange={(e) => handleChange('example', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="りんごを食べます"
            />
          </div>

          {/* Example Translation */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🌏 Example Translation
            </label>
            <input
              type="text"
              value={formData.exampleTranslation || ''}
              onChange={(e) => handleChange('exampleTranslation', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Tôi ăn táo"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              📋 Notes (Ghi chú)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows="3"
              placeholder="Group 2 verb, irregular..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              🏷️ Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="verb, food, N5..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
              >
                ➕
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.tags || []).map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(i)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✖️
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-200">
            {!isEditingExisting && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, { closeAfterSave: false })}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg border-2 border-black
                         font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                         hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         transition-all"
              >
                ✅ Lưu & Tiếp Tục
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, { closeAfterSave: true })}
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg border-2 border-black
                       font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all"
            >
              {isEditingExisting ? '💾 Cập nhật & Đóng' : '↩️ Lưu & Quay Lại'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-300 text-gray-700 rounded-lg border-2 border-black
                       font-bold hover:bg-gray-400 transition-colors"
            >
              ❌ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== CARD PREVIEW MODAL ==========
function CardPreviewModal({ card, onClose }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    max-w-lg w-full">
        {/* Header */}
        <div className="bg-blue-500 border-b-[3px] border-black p-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-white">👁️ Preview Flashcard</h3>
          <button
            onClick={onClose}
            className="text-2xl text-white hover:text-red-300 transition-colors"
          >
            ✖️
          </button>
        </div>

        {/* Card */}
        <div className="p-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full h-64 cursor-pointer perspective-1000"
          >
            <div className={`
              absolute inset-0 transition-transform duration-500 transform-style-3d
              ${isFlipped ? 'rotate-y-180' : ''}
            `}>
              {/* Front */}
              {!isFlipped && (
                <div className="absolute inset-0 p-6 bg-gradient-to-br from-blue-400 to-blue-600
                              border-[3px] border-black rounded-lg
                              flex flex-col items-center justify-center text-center
                              shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-4xl font-black text-white mb-4">{card.front}</p>
                  {card.reading && (
                    <p className="text-xl font-mono text-blue-100">{card.reading}</p>
                  )}
                  <p className="text-sm text-blue-200 mt-6">👆 Click để lật</p>
                </div>
              )}

              {/* Back */}
              {isFlipped && (
                <div className="absolute inset-0 p-6 bg-gradient-to-br from-green-400 to-green-600
                              border-[3px] border-black rounded-lg
                              flex flex-col items-center justify-center text-center
                              shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-3xl font-black text-white mb-4">{card.back}</p>
                  {card.example && (
                    <div className="mt-4 p-3 bg-white/20 rounded-lg">
                      <p className="text-sm text-white font-bold">{card.example}</p>
                      {card.exampleTranslation && (
                        <p className="text-xs text-green-100 mt-1">{card.exampleTranslation}</p>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-green-200 mt-6">👆 Click để lật lại</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-[3px] border-black p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg border-2 border-black
                     font-bold hover:bg-gray-400 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardEditor;

