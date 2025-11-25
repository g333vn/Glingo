// src/utils/duplicateHelper.js
// 📋 Duplicate Helper - Clone lessons, chapters, etc.

import storageManager from './localStorageManager.js';

/**
 * Duplicate a lesson
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} lessonId 
 * @param {string} newTitle - Optional custom title for duplicate
 * @returns {Promise<Object>} - New lesson object
 */
export async function duplicateLesson(bookId, chapterId, lessonId, newTitle = null) {
  try {
    // Get existing lessons
    const lessons = await storageManager.getLessons(bookId, chapterId);
    if (!lessons) {
      throw new Error('Lessons not found');
    }
    
    // Find the lesson to duplicate
    const originalLesson = lessons.find(l => l.id === lessonId);
    if (!originalLesson) {
      throw new Error('Lesson not found');
    }
    
    // Generate new ID
    const timestamp = Date.now();
    const newId = `${lessonId}_copy_${timestamp}`;
    
    // Create duplicate (clone all fields except id, createdAt)
    const duplicateLesson = {
      ...originalLesson,
      id: newId,
      title: newTitle || `${originalLesson.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false // Duplicate as draft by default
    };
    
    // Add to lessons array
    const updatedLessons = [...lessons, duplicateLesson];
    
    // Save to storage
    await storageManager.saveLessons(bookId, chapterId, updatedLessons);
    
    // Also duplicate quiz if exists
    const originalQuiz = await storageManager.getQuiz(bookId, chapterId, lessonId);
    if (originalQuiz) {
      await storageManager.saveQuiz(bookId, chapterId, newId, {
        ...originalQuiz,
        title: `${originalQuiz.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log(`✅ Duplicated lesson: ${lessonId} -> ${newId}`);
    return duplicateLesson;
  } catch (error) {
    console.error('Error duplicating lesson:', error);
    throw error;
  }
}

/**
 * Duplicate a chapter (with all its lessons)
 * @param {string} bookId 
 * @param {string} chapterId 
 * @param {string} newTitle - Optional custom title
 * @returns {Promise<Object>} - New chapter object
 */
export async function duplicateChapter(bookId, chapterId, newTitle = null) {
  try {
    // Get existing chapters
    const chapters = await storageManager.getChapters(bookId);
    if (!chapters) {
      throw new Error('Chapters not found');
    }
    
    // Find chapter to duplicate
    const originalChapter = chapters.find(ch => ch.id === chapterId);
    if (!originalChapter) {
      throw new Error('Chapter not found');
    }
    
    // Generate new ID
    const timestamp = Date.now();
    const newChapterId = `${chapterId}_copy_${timestamp}`;
    
    // Create duplicate chapter
    const duplicateChapter = {
      ...originalChapter,
      id: newChapterId,
      title: newTitle || `${originalChapter.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };
    
    // Add to chapters array
    const updatedChapters = [...chapters, duplicateChapter];
    await storageManager.saveChapters(bookId, updatedChapters);
    
    // Duplicate all lessons in this chapter
    const originalLessons = await storageManager.getLessons(bookId, chapterId);
    if (originalLessons && originalLessons.length > 0) {
      const duplicatedLessons = originalLessons.map(lesson => ({
        ...lesson,
        id: `${lesson.id}_copy_${timestamp}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false
      }));
      
      await storageManager.saveLessons(bookId, newChapterId, duplicatedLessons);
      
      // Duplicate quizzes for each lesson
      for (const originalLesson of originalLessons) {
        const originalQuiz = await storageManager.getQuiz(bookId, chapterId, originalLesson.id);
        if (originalQuiz) {
          const newLessonId = `${originalLesson.id}_copy_${timestamp}`;
          await storageManager.saveQuiz(bookId, newChapterId, newLessonId, {
            ...originalQuiz,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
      
      console.log(`✅ Duplicated ${duplicatedLessons.length} lessons with quizzes`);
    }
    
    console.log(`✅ Duplicated chapter: ${chapterId} -> ${newChapterId}`);
    return duplicateChapter;
  } catch (error) {
    console.error('Error duplicating chapter:', error);
    throw error;
  }
}

/**
 * Duplicate a book (with all chapters and lessons)
 * @param {string} levelId 
 * @param {string} bookId 
 * @param {string} newTitle - Optional custom title
 * @returns {Promise<Object>} - New book object
 */
export async function duplicateBook(levelId, bookId, newTitle = null) {
  try {
    // Get existing books
    const books = await storageManager.getBooks(levelId);
    if (!books) {
      throw new Error('Books not found');
    }
    
    // Find book to duplicate
    const originalBook = books.find(b => b.id === bookId);
    if (!originalBook) {
      throw new Error('Book not found');
    }
    
    // Generate new ID
    const timestamp = Date.now();
    const newBookId = `${bookId}_copy_${timestamp}`;
    
    // Create duplicate book
    const duplicateBook = {
      ...originalBook,
      id: newBookId,
      title: newTitle || `${originalBook.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      published: false
    };
    
    // Add to books array
    const updatedBooks = [...books, duplicateBook];
    await storageManager.saveBooks(levelId, updatedBooks);
    
    // Duplicate all chapters
    const originalChapters = await storageManager.getChapters(bookId);
    if (originalChapters && originalChapters.length > 0) {
      const duplicatedChapters = originalChapters.map(chapter => ({
        ...chapter,
        id: `${chapter.id}_copy_${timestamp}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: false
      }));
      
      await storageManager.saveChapters(newBookId, duplicatedChapters);
      
      // Duplicate lessons and quizzes for each chapter
      for (let i = 0; i < originalChapters.length; i++) {
        const originalChapter = originalChapters[i];
        const newChapterId = duplicatedChapters[i].id;
        
        const originalLessons = await storageManager.getLessons(bookId, originalChapter.id);
        if (originalLessons && originalLessons.length > 0) {
          const duplicatedLessons = originalLessons.map(lesson => ({
            ...lesson,
            id: `${lesson.id}_copy_${timestamp}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: false
          }));
          
          await storageManager.saveLessons(newBookId, newChapterId, duplicatedLessons);
          
          // Duplicate quizzes
          for (let j = 0; j < originalLessons.length; j++) {
            const originalLesson = originalLessons[j];
            const newLessonId = duplicatedLessons[j].id;
            
            const originalQuiz = await storageManager.getQuiz(bookId, originalChapter.id, originalLesson.id);
            if (originalQuiz) {
              await storageManager.saveQuiz(newBookId, newChapterId, newLessonId, {
                ...originalQuiz,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }
        }
      }
      
      console.log(`✅ Duplicated ${duplicatedChapters.length} chapters with all lessons and quizzes`);
    }
    
    console.log(`✅ Duplicated book: ${bookId} -> ${newBookId}`);
    return duplicateBook;
  } catch (error) {
    console.error('Error duplicating book:', error);
    throw error;
  }
}

export default {
  duplicateLesson,
  duplicateChapter,
  duplicateBook
};

