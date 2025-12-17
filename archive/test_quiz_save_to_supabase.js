/**
 * Script Test: Kiểm Tra Quiz Có Được Lưu Lên Supabase Không
 * 
 * Cách sử dụng:
 * 1. Mở Developer Tools (F12) → Console
 * 2. Copy toàn bộ script này và paste vào Console
 * 3. Nhấn Enter để chạy
 * 
 * Script sẽ:
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra user có role = 'admin' không
 * - Test save quiz trực tiếp lên Supabase
 * - Hiển thị kết quả chi tiết
 */

(async function testQuizSaveToSupabase() {
  console.log('🔍 Bắt đầu kiểm tra Quiz Save to Supabase...\n');
  
  try {
    // 1. Import Supabase client
    const { supabase } = await import('./src/services/supabaseClient.js');
    console.log('✅ Đã import Supabase client');
    
    // 2. Kiểm tra session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Lỗi khi lấy session:', sessionError);
      return;
    }
    
    if (!session || !session.user) {
      console.error('❌ Bạn chưa đăng nhập! Vui lòng đăng nhập trước.');
      alert('❌ Bạn chưa đăng nhập! Vui lòng đăng nhập trước.');
      return;
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    console.log('✅ User đã đăng nhập:');
    console.log('   - User ID:', userId);
    console.log('   - Email:', userEmail);
    
    // 3. Kiểm tra user role
    console.log('\n🔍 Kiểm tra user role...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, role, email')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Lỗi khi lấy profile:', profileError);
      console.error('   - Error code:', profileError.code);
      console.error('   - Error message:', profileError.message);
      alert('❌ Lỗi khi lấy profile:\n' + profileError.message);
      return;
    }
    
    if (!profile) {
      console.error('❌ Không tìm thấy profile cho user này!');
      alert('❌ Không tìm thấy profile cho user này!\n\nVui lòng tạo profile trước.');
      return;
    }
    
    console.log('✅ Profile:', profile);
    console.log('   - Role:', profile.role);
    
    if (profile.role !== 'admin') {
      console.error('❌ User KHÔNG có role = "admin"!');
      console.error('   - Role hiện tại:', profile.role);
      console.error('   - Cần role: admin');
      alert(
        '❌ User KHÔNG có quyền admin!\n\n' +
        'Role hiện tại: ' + profile.role + '\n' +
        'Cần role: admin\n\n' +
        'Vui lòng chạy script: update_user_role_to_admin.sql'
      );
      return;
    }
    
    console.log('✅ User có role = "admin"');
    
    // 4. Kiểm tra RLS policies
    console.log('\n🔍 Kiểm tra RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            policyname,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE tablename = 'quizzes'
          ORDER BY policyname;
        `
      });
    
    // Note: exec_sql có thể không có, dùng cách khác
    console.log('ℹ️ Không thể kiểm tra RLS policies trực tiếp từ client.');
    console.log('   Vui lòng kiểm tra trong Supabase Dashboard → SQL Editor');
    
    // 5. Test save quiz
    console.log('\n🔍 Test save quiz lên Supabase...');
    
    const testQuiz = {
      id: 'test-quiz-' + Date.now(),
      book_id: 'test-book',
      chapter_id: 'test-chapter',
      lesson_id: 'test-lesson',
      level: 'n5',
      title: 'Test Quiz - ' + new Date().toISOString(),
      description: 'Test quiz để kiểm tra save to Supabase',
      questions: [
        {
          id: 1,
          question: 'Đây là câu hỏi test?',
          options: [
            { label: 'A', text: 'Đáp án A' },
            { label: 'B', text: 'Đáp án B' },
            { label: 'C', text: 'Đáp án C' },
            { label: 'D', text: 'Đáp án D' }
          ],
          correctAnswer: 'A',
          explanation: 'Đây là giải thích test'
        }
      ],
      time_limit: null,
      passing_score: 60,
      created_by: userId,
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Đang save quiz:', {
      id: testQuiz.id,
      level: testQuiz.level,
      title: testQuiz.title,
      questionsCount: testQuiz.questions.length
    });
    
    const { data: savedQuiz, error: saveError } = await supabase
      .from('quizzes')
      .upsert(testQuiz, { onConflict: 'id' })
      .select()
      .single();
    
    if (saveError) {
      console.error('❌ Lỗi khi save quiz:', saveError);
      console.error('   - Error code:', saveError.code);
      console.error('   - Error message:', saveError.message);
      console.error('   - Error details:', saveError.details);
      console.error('   - Error hint:', saveError.hint);
      
      if (saveError.code === '42501') {
        console.error('\n❌ RLS Policy Error!');
        console.error('   User không có quyền INSERT vào bảng quizzes.');
        console.error('   Vui lòng:');
        console.error('   1. Kiểm tra user có role = "admin" không');
        console.error('   2. Chạy script: fix_quizzes_rls_for_anonymous.sql');
        alert(
          '❌ RLS Policy Error!\n\n' +
          'User không có quyền INSERT vào bảng quizzes.\n\n' +
          'Vui lòng:\n' +
          '1. Kiểm tra user có role = "admin" không\n' +
          '2. Chạy script: fix_quizzes_rls_for_anonymous.sql'
        );
      } else {
        alert(
          '❌ Lỗi khi save quiz:\n\n' +
          'Error code: ' + saveError.code + '\n' +
          'Error message: ' + saveError.message
        );
      }
      return;
    }
    
    console.log('✅ Quiz đã được save thành công!');
    console.log('   - Quiz ID:', savedQuiz.id);
    console.log('   - Title:', savedQuiz.title);
    console.log('   - Level:', savedQuiz.level);
    console.log('   - Created by:', savedQuiz.created_by);
    
    // 6. Verify quiz có trong database
    console.log('\n🔍 Verify quiz có trong database...');
    const { data: verifyQuiz, error: verifyError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', testQuiz.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Không tìm thấy quiz sau khi save:', verifyError);
      alert('❌ Không tìm thấy quiz sau khi save!');
      return;
    }
    
    console.log('✅ Quiz đã có trong database!');
    console.log('   - Verified:', verifyQuiz.id === testQuiz.id);
    
    // 7. Cleanup: Xóa test quiz
    console.log('\n🧹 Xóa test quiz...');
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', testQuiz.id);
    
    if (deleteError) {
      console.warn('⚠️ Không thể xóa test quiz:', deleteError);
      console.warn('   Bạn có thể xóa thủ công trong Supabase Dashboard');
    } else {
      console.log('✅ Đã xóa test quiz');
    }
    
    // 8. Kết luận
    console.log('\n✅ KẾT QUẢ:');
    console.log('   ✅ User đã đăng nhập');
    console.log('   ✅ User có role = "admin"');
    console.log('   ✅ Quiz có thể được save lên Supabase');
    console.log('   ✅ Quiz có thể được đọc từ Supabase');
    console.log('\n✅ Hệ thống hoạt động bình thường!');
    console.log('   Nếu quiz trong app không được lưu, vấn đề có thể là:');
    console.log('   1. selectedLevel không được truyền vào saveQuiz()');
    console.log('   2. userId không được truyền vào saveQuiz()');
    console.log('   3. Kiểm tra Console logs khi save quiz trong app');
    
    alert(
      '✅ Test thành công!\n\n' +
      'Hệ thống có thể save quiz lên Supabase.\n\n' +
      'Nếu quiz trong app không được lưu, vấn đề có thể là:\n' +
      '1. selectedLevel không được truyền\n' +
      '2. userId không được truyền\n' +
      '3. Kiểm tra Console logs khi save quiz'
    );
    
  } catch (err) {
    console.error('❌ Lỗi không mong đợi:', err);
    console.error('   - Error message:', err.message);
    console.error('   - Error stack:', err.stack);
    alert('❌ Lỗi không mong đợi:\n' + err.message);
  }
})();

