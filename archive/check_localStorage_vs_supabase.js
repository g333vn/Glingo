// ========================================
// KIỂM TRA localStorage vs Supabase
// ========================================
// Chạy script này trong Browser Console (F12 > Console)
// Để so sánh dữ liệu giữa localStorage và Supabase

async function checkLocalStorageVsSupabase() {
  console.log('🔍 KIỂM TRA localStorage vs Supabase\n');
  
  // 1. Kiểm tra localStorage
  console.log('📦 LOCALSTORAGE:');
  const levelStorage = localStorage.getItem('levelAccessControl');
  const jlptStorage = localStorage.getItem('jlptAccessControl');
  
  const levelConfigs = levelStorage ? JSON.parse(levelStorage) : {};
  const jlptConfigs = jlptStorage ? JSON.parse(jlptStorage) : {};
  
  console.log('LEVEL Module - localStorage:');
  console.log('  N1:', levelConfigs.n1 || 'Chưa có cấu hình');
  console.log('  N2:', levelConfigs.n2 || 'Chưa có cấu hình');
  console.log('  N3:', levelConfigs.n3 || 'Chưa có cấu hình');
  
  console.log('\nJLPT Module - localStorage:');
  console.log('  N1:', jlptConfigs.n1 || 'Chưa có cấu hình');
  console.log('  N2:', jlptConfigs.n2 || 'Chưa có cấu hình');
  console.log('  N3:', jlptConfigs.n3 || 'Chưa có cấu hình');
  
  // 2. Kiểm tra Supabase (nếu có)
  console.log('\n☁️ SUPABASE:');
  try {
    // Import từ window hoặc từ module
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
    // Lấy credentials từ env hoặc window
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️ Không tìm thấy Supabase credentials');
      console.log('   Vui lòng kiểm tra từ Admin Control Page hoặc chạy SQL trực tiếp');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('access_control')
      .eq('id', 1)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Lỗi khi load từ Supabase:', error);
      return;
    }
    
    if (!data || !data.access_control) {
      console.log('⚠️ Không có dữ liệu access_control trong Supabase');
      return;
    }
    
    const accessControl = data.access_control;
    
    console.log('LEVEL Module - Supabase:');
    console.log('  N1:', accessControl.level?.n1 || 'Chưa có cấu hình');
    console.log('  N2:', accessControl.level?.n2 || 'Chưa có cấu hình');
    console.log('  N3:', accessControl.level?.n3 || 'Chưa có cấu hình');
    
    console.log('\nJLPT Module - Supabase:');
    console.log('  N1:', accessControl.jlpt?.n1 || 'Chưa có cấu hình');
    console.log('  N2:', accessControl.jlpt?.n2 || 'Chưa có cấu hình');
    console.log('  N3:', accessControl.jlpt?.n3 || 'Chưa có cấu hình');
    
    // 3. So sánh
    console.log('\n🔍 SO SÁNH:');
    
    const levelN1Local = levelConfigs.n1?.accessType || 'all';
    const levelN1Supabase = accessControl.level?.n1?.accessType || 'all';
    
    if (levelN1Local !== levelN1Supabase) {
      console.log('⚠️ LEVEL N1 KHÁC NHAU:');
      console.log('   localStorage:', levelN1Local);
      console.log('   Supabase:', levelN1Supabase);
      console.log('   → Cần sync lại!');
    } else {
      console.log('✅ LEVEL N1 giống nhau:', levelN1Local);
    }
    
    const jlptN1Local = jlptConfigs.n1?.accessType || 'all';
    const jlptN1Supabase = accessControl.jlpt?.n1?.accessType || 'all';
    
    if (jlptN1Local !== jlptN1Supabase) {
      console.log('⚠️ JLPT N1 KHÁC NHAU:');
      console.log('   localStorage:', jlptN1Local);
      console.log('   Supabase:', jlptN1Supabase);
      console.log('   → Cần sync lại!');
    } else {
      console.log('✅ JLPT N1 giống nhau:', jlptN1Local);
    }
    
  } catch (err) {
    console.error('❌ Lỗi:', err);
    console.log('\n💡 HƯỚNG DẪN:');
    console.log('   1. Mở Admin Control Page');
    console.log('   2. Xem console để thấy dữ liệu từ Supabase');
    console.log('   3. Hoặc chạy SQL script: check_both_modules_and_sync.sql');
  }
}

// Chạy ngay
checkLocalStorageVsSupabase();

// Export để có thể gọi lại
window.checkLocalStorageVsSupabase = checkLocalStorageVsSupabase;

