// Script để debug access control
// Chạy trong Browser Console (F12 > Console)

function debugAccessControl() {
  console.log('🔍 DEBUG ACCESS CONTROL\n');
  
  // 1. Kiểm tra module-level config
  console.log('📦 Module-level configs:');
  const levelModuleConfig = localStorage.getItem('levelModuleAccessControl');
  const jlptModuleConfig = localStorage.getItem('jlptModuleAccessControl');
  
  console.log('LEVEL module:', levelModuleConfig ? JSON.parse(levelModuleConfig) : 'NOT SET (default: all)');
  console.log('JLPT module:', jlptModuleConfig ? JSON.parse(jlptModuleConfig) : 'NOT SET (default: all)');
  
  // 2. Kiểm tra level-specific configs
  console.log('\n📦 Level-specific configs:');
  const levelConfigs = localStorage.getItem('levelAccessControl');
  const jlptConfigs = localStorage.getItem('jlptAccessControl');
  
  console.log('LEVEL levels:', levelConfigs ? JSON.parse(levelConfigs) : 'NOT SET');
  console.log('JLPT levels:', jlptConfigs ? JSON.parse(jlptConfigs) : 'NOT SET');
  
  // 3. Test hasAccess function
  console.log('\n🧪 Testing hasAccess:');
  
  // Import hasAccess
  import('./src/utils/accessControlManager.js').then(module => {
    const { hasAccess } = module;
    
    // Test với guest user (null)
    console.log('\n--- Test với Guest User (null) ---');
    const guestAccess = {
      n1: hasAccess('level', 'n1', null),
      n2: hasAccess('level', 'n2', null),
      n3: hasAccess('level', 'n3', null),
      n4: hasAccess('level', 'n4', null),
      n5: hasAccess('level', 'n5', null)
    };
    console.log('Guest access:', guestAccess);
    
    // Test với user role
    console.log('\n--- Test với User Role ---');
    const userAccess = {
      n1: hasAccess('level', 'n1', { role: 'user' }),
      n2: hasAccess('level', 'n2', { role: 'user' }),
      n3: hasAccess('level', 'n3', { role: 'user' }),
      n4: hasAccess('level', 'n4', { role: 'user' }),
      n5: hasAccess('level', 'n5', { role: 'user' })
    };
    console.log('User access:', userAccess);
    
    // Test với editor role
    console.log('\n--- Test với Editor Role ---');
    const editorAccess = {
      n1: hasAccess('level', 'n1', { role: 'editor' }),
      n2: hasAccess('level', 'n2', { role: 'editor' }),
      n3: hasAccess('level', 'n3', { role: 'editor' }),
      n4: hasAccess('level', 'n4', { role: 'editor' }),
      n5: hasAccess('level', 'n5', { role: 'editor' })
    };
    console.log('Editor access:', editorAccess);
  }).catch(err => {
    console.error('❌ Error importing hasAccess:', err);
    console.log('\n💡 Chạy script này trong Browser Console khi đang ở trang web');
  });
  
  return {
    levelModuleConfig: levelModuleConfig ? JSON.parse(levelModuleConfig) : null,
    jlptModuleConfig: jlptModuleConfig ? JSON.parse(jlptModuleConfig) : null,
    levelConfigs: levelConfigs ? JSON.parse(levelConfigs) : null,
    jlptConfigs: jlptConfigs ? JSON.parse(jlptConfigs) : null
  };
}

// Chạy ngay
const configs = debugAccessControl();
console.log('\n📊 Configs summary:', configs);

