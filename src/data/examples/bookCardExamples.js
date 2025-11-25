// src/data/examples/bookCardExamples.js
// 📚 BookCard Examples - Demonstrating all variants

/**
 * Example 1: Normal book with cover image
 */
export const normalBook = {
  id: 'shinkanzen-n1-bunpou',
  title: 'Shinkanzen Master N1 Bunpou',
  imageUrl: '/book_card/n1/shinkanzen/shinkanzen_n1_bunpo.jpg',
  category: '新完全マスター'
};

/**
 * Example 2: Coming Soon book (no image yet)
 */
export const comingSoonBook = {
  id: 'new-jlpt-n1-2025',
  title: 'New JLPT N1 Complete Guide 2025',
  imageUrl: null,
  isComingSoon: true,
  category: 'New Releases'
};

/**
 * Example 3: Book with custom status
 */
export const newEditionBook = {
  id: 'try-n1-grammar-new',
  title: 'TRY! N1 Grammar - New Edition',
  imageUrl: null,
  status: 'New Edition',
  category: 'TRY!'
};

/**
 * Example 4: Book without cover image
 */
export const noCoverBook = {
  id: 'japanese-kanji-handbook',
  title: 'Japanese Kanji Handbook',
  imageUrl: null, // No image, no status
  category: 'Kanji'
};

/**
 * Example 5: Book with broken image URL (will fallback to placeholder)
 */
export const brokenImageBook = {
  id: 'sample-book',
  title: 'Sample Textbook',
  imageUrl: '/path/to/missing/image.jpg', // This will error and show placeholder
  category: 'Sample'
};

/**
 * Example 6: Coming Soon with custom title
 */
export const comingSoonSpecial = {
  id: 'ultimate-n1-master',
  title: 'Ultimate N1 Master - All-in-One',
  imageUrl: null,
  isComingSoon: true,
  category: 'Premium'
};

/**
 * Example 7: Book with status badge
 */
export const updatedBook = {
  id: 'genki-n5-updated',
  title: 'GENKI I - Updated Version',
  imageUrl: null,
  status: 'Updated',
  category: 'GENKI'
};

/**
 * All examples collection
 */
export const allBookExamples = [
  normalBook,
  comingSoonBook,
  newEditionBook,
  noCoverBook,
  brokenImageBook,
  comingSoonSpecial,
  updatedBook
];

/**
 * Usage example in component:
 * 
 * ```jsx
 * import { BookCard } from '../components/BookCard';
 * import { comingSoonBook, normalBook } from '../data/examples/bookCardExamples';
 * 
 * // Normal book
 * <BookCard {...normalBook} />
 * 
 * // Coming soon book
 * <BookCard {...comingSoonBook} />
 * 
 * // New edition book
 * <BookCard {...newEditionBook} />
 * ```
 */

