// scripts/import-sample-book.js
// 📥 Import Sample Book Script - Run in browser console

/**
 * HOW TO USE:
 * 
 * 1. Open your app in browser
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire file
 * 5. Press Enter
 * 6. Wait for completion message
 */

(async function importSampleBook() {
  console.log('📦 Starting Sample Book Import...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Complete Book Data
  const sampleData = {
    series: {
      id: 'sample-series-001',
      name: 'Sample JLPT Series',
      description: 'Complete sample series for demonstration',
      level: 'n1'
    },
    
    book: {
      id: 'sample-book-001',
      title: 'Complete Sample Textbook N1',
      imageUrl: null,
      isComingSoon: true,
      category: 'Sample JLPT Series',
      level: 'n1',
      description: 'A complete sample book with all features'
    },
    
    chapters: [
      {
        id: 'chapter-1',
        title: 'Chapter 1: Basic Grammar',
        description: 'Learn fundamental grammar',
        order: 1
      },
      {
        id: 'chapter-2',
        title: 'Chapter 2: Essential Vocabulary',
        description: 'Build vocabulary foundation',
        order: 2
      },
      {
        id: 'chapter-3',
        title: 'Chapter 3: Reading Practice',
        description: 'Improve reading skills',
        order: 3
      }
    ],
    
    lessons: {
      'sample-book-001_chapter-1': [
        {
          id: 'lesson-1-1',
          title: 'Lesson 1.1: Particle は',
          description: 'Learn topic particle',
          order: 1,
          pdfUrl: '/pdfs/samples/lesson1-1.pdf',
          published: true
        },
        {
          id: 'lesson-1-2',
          title: 'Lesson 1.2: Particle が',
          description: 'Learn subject particle',
          order: 2,
          content: '<div><h2>Particle が</h2><p>Subject marker...</p></div>',
          published: true
        },
        {
          id: 'lesson-1-3',
          title: 'Lesson 1.3: は vs が',
          description: 'Comparison and practice',
          order: 3,
          pdfUrl: '/pdfs/samples/lesson1-3.pdf',
          content: '<div><h2>Quick Reference</h2></div>',
          published: true
        }
      ],
      'sample-book-001_chapter-2': [
        {
          id: 'lesson-2-1',
          title: 'Lesson 2.1: Family Vocabulary',
          description: 'Family words',
          order: 1,
          content: '<div><h2>Family</h2><p>父、母...</p></div>',
          published: true
        },
        {
          id: 'lesson-2-2',
          title: 'Lesson 2.2: Business Vocabulary',
          description: 'Work-related words',
          order: 2,
          pdfUrl: '/pdfs/samples/lesson2-2.pdf',
          published: true
        },
        {
          id: 'lesson-2-3',
          title: 'Lesson 2.3: Practice Test',
          description: 'Vocabulary test',
          order: 3,
          published: true
        }
      ],
      'sample-book-001_chapter-3': [
        {
          id: 'lesson-3-1',
          title: 'Lesson 3.1: Reading Strategies',
          description: 'Effective techniques',
          order: 1,
          pdfUrl: '/pdfs/samples/lesson3-1.pdf',
          content: '<div><h2>5 Steps</h2></div>',
          published: true
        },
        {
          id: 'lesson-3-2',
          title: 'Lesson 3.2: Short Passages',
          description: 'Practice short texts',
          order: 2,
          pdfUrl: '/pdfs/samples/lesson3-2.pdf',
          published: true
        },
        {
          id: 'lesson-3-3',
          title: 'Lesson 3.3: Long Passages',
          description: 'Practice long texts',
          order: 3,
          pdfUrl: '/pdfs/samples/lesson3-3.pdf',
          published: true
        }
      ]
    }
  };
  
  // Import function
  async function runImport() {
    // Check if storageManager exists
    if (typeof storageManager === 'undefined') {
      console.error('❌ storageManager not found!');
      console.log('Make sure you are on the app page (not login/about)');
      return false;
    }
    
    try {
      // 1. Import Series
      console.log('');
      console.log('Step 1/5: Importing Series...');
      const existingSeries = await storageManager.getSeries('n1') || [];
      if (!existingSeries.find(s => s.id === sampleData.series.id)) {
        await storageManager.saveSeries('n1', [...existingSeries, sampleData.series]);
        console.log('✅ Series imported: ' + sampleData.series.name);
      } else {
        console.log('ℹ️  Series already exists, skipping...');
      }
      
      // 2. Import Book
      console.log('');
      console.log('Step 2/5: Importing Book...');
      const existingBooks = await storageManager.getBooks('n1') || [];
      if (!existingBooks.find(b => b.id === sampleData.book.id)) {
        await storageManager.saveBooks('n1', [...existingBooks, sampleData.book]);
        console.log('✅ Book imported: ' + sampleData.book.title);
      } else {
        console.log('ℹ️  Book already exists, skipping...');
      }
      
      // 3. Import Chapters
      console.log('');
      console.log('Step 3/5: Importing Chapters...');
      await storageManager.saveChapters(sampleData.book.id, sampleData.chapters);
      console.log('✅ Imported ' + sampleData.chapters.length + ' chapters');
      sampleData.chapters.forEach(ch => {
        console.log('   - ' + ch.title);
      });
      
      // 4. Import Lessons
      console.log('');
      console.log('Step 4/5: Importing Lessons...');
      let totalLessons = 0;
      for (const [key, lessonList] of Object.entries(sampleData.lessons)) {
        const [bookId, chapterId] = key.split('_');
        await storageManager.saveLessons(bookId, chapterId, lessonList);
        totalLessons += lessonList.length;
        console.log(`   - ${chapterId}: ${lessonList.length} lessons`);
      }
      console.log('✅ Imported ' + totalLessons + ' lessons total');
      
      // 5. Summary
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 IMPORT COMPLETE!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('📊 Summary:');
      console.log('  ✅ Series:   1');
      console.log('  ✅ Books:    1');
      console.log('  ✅ Chapters: ' + sampleData.chapters.length);
      console.log('  ✅ Lessons:  ' + totalLessons);
      console.log('');
      console.log('🔗 View at:');
      console.log('  http://localhost:5173/level/n1');
      console.log('  → Find "Complete Sample Textbook N1"');
      console.log('');
      console.log('📚 Features demonstrated:');
      console.log('  ✅ PDF lessons (lesson-1-1, lesson-1-3, ...)');
      console.log('  ✅ HTML lessons (lesson-1-2, lesson-2-1, ...)');
      console.log('  ✅ Mixed lessons (both PDF + HTML)');
      console.log('  ✅ Quiz-only lessons (lesson-2-3)');
      console.log('  ✅ All lesson types and formats');
      console.log('');
      
      alert('✅ Sample book imported successfully!\n\nCheck console for details.');
      
      return true;
    } catch (error) {
      console.error('');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ IMPORT FAILED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.error('');
      alert('❌ Import failed! Check console for details.');
      return false;
    }
  }
  
  // Run import
  runImport();
})();

/**
 * ALTERNATIVE: Manual import via Admin Panel
 * 
 * 1. Go to: Admin Panel → Content Management
 * 2. Select Level: N1
 * 
 * 3. Add Series:
 *    - Name: Sample JLPT Series
 *    - Description: Complete sample series
 * 
 * 4. Add Book:
 *    - ID: sample-book-001
 *    - Title: Complete Sample Textbook N1
 *    - Category: Sample JLPT Series
 *    - Is Coming Soon: ✓
 * 
 * 5. Add Chapter 1:
 *    - ID: chapter-1
 *    - Title: Chapter 1: Basic Grammar
 *    - Description: Learn fundamental grammar
 * 
 * 6. Add Lesson 1.1:
 *    - ID: lesson-1-1
 *    - Title: Lesson 1.1: Particle は
 *    - PDF URL: /pdfs/samples/lesson1-1.pdf
 * 
 * 7. Add Quiz for Lesson 1.1:
 *    - 10 questions about は particle
 * 
 * 8. Repeat for other lessons...
 */

