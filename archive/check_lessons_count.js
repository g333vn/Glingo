// Script để kiểm tra số lượng lessons trong database
// Chạy: node check_lessons_count.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLessonsCount() {
  console.log('🔍 Checking lessons count in Supabase...\n');

  try {
    // Lấy tất cả lessons, group by book_id, chapter_id, level
    const { data: allLessons, error } = await supabase
      .from('lessons')
      .select('book_id, chapter_id, level, id, title, order_index')
      .order('level', { ascending: true })
      .order('book_id', { ascending: true })
      .order('chapter_id', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }

    if (!allLessons || allLessons.length === 0) {
      console.log('⚠️ No lessons found in database');
      return;
    }

    console.log(`📊 Total lessons in database: ${allLessons.length}\n`);

    // Group by book_id, chapter_id, level
    const grouped = {};
    allLessons.forEach(lesson => {
      const key = `${lesson.level}/${lesson.book_id}/${lesson.chapter_id}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(lesson);
    });

    // Hiển thị chi tiết
    console.log('📚 Lessons by location:\n');
    Object.keys(grouped).sort().forEach(key => {
      const lessons = grouped[key];
      const [level, bookId, chapterId] = key.split('/');
      console.log(`  ${key}: ${lessons.length} lessons`);
      
      // Nếu có ít hơn 10 lessons, hiển thị chi tiết
      if (lessons.length < 10) {
        lessons.forEach((lesson, idx) => {
          console.log(`    ${idx + 1}. ${lesson.id} - ${lesson.title || 'No title'} (order: ${lesson.order_index})`);
        });
      } else {
        // Hiển thị 5 lessons đầu và cuối
        console.log(`    First 5:`);
        lessons.slice(0, 5).forEach((lesson, idx) => {
          console.log(`      ${idx + 1}. ${lesson.id} - ${lesson.title || 'No title'} (order: ${lesson.order_index})`);
        });
        console.log(`    ...`);
        console.log(`    Last 5:`);
        lessons.slice(-5).forEach((lesson, idx) => {
          const actualIdx = lessons.length - 5 + idx + 1;
          console.log(`      ${actualIdx}. ${lesson.id} - ${lesson.title || 'No title'} (order: ${lesson.order_index})`);
        });
      }
      console.log('');
    });

    // Tìm các chapter có ít lessons (có thể bị mất dữ liệu)
    console.log('⚠️ Chapters with less than 10 lessons (possible data loss):\n');
    Object.keys(grouped).sort().forEach(key => {
      const lessons = grouped[key];
      if (lessons.length < 10 && lessons.length > 0) {
        const [level, bookId, chapterId] = key.split('/');
        console.log(`  ${key}: ${lessons.length} lessons`);
      }
    });

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkLessonsCount();

