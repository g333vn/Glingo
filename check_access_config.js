// Script để kiểm tra access config trong localStorage
// Chạy trong Browser Console (F12 > Console)

function checkAccessConfig() {
  console.log('🔍 KIỂM TRA ACCESS CONFIG\n');
  
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
  
  const levelConfigsParsed = levelConfigs ? JSON.parse(levelConfigs) : {};
  const jlptConfigsParsed = jlptConfigs ? JSON.parse(jlptConfigs) : {};
  
  console.log('LEVEL levels:', levelConfigsParsed);
  console.log('JLPT levels:', jlptConfigsParsed);
  
  // 3. Kiểm tra từng level
  console.log('\n📊 Chi tiết từng level:');
  const levels = ['n1', 'n2', 'n3', 'n4', 'n5'];
  
  levels.forEach(levelId => {
    const levelConfig = levelConfigsParsed[levelId] || { accessType: 'all', allowedRoles: [], allowedUsers: [] };
    const jlptConfig = jlptConfigsParsed[levelId] || { accessType: 'all', allowedRoles: [], allowedRoles: [], allowedUsers: [] };
    
    console.log(`\n${levelId.toUpperCase()}:`);
    console.log(`  LEVEL:`, {
      accessType: levelConfig.accessType,
      allowedRoles: levelConfig.allowedRoles,
      allowedUsers: levelConfig.allowedUsers,
      status: levelConfig.accessType === 'none' ? '❌ BLOCKED' : levelConfig.accessType === 'all' ? '✅ ALLOWED' : '⚠️ RESTRICTED'
    });
    console.log(`  JLPT:`, {
      accessType: jlptConfig.accessType,
      allowedRoles: jlptConfig.allowedRoles,
      allowedUsers: jlptConfig.allowedUsers,
      status: jlptConfig.accessType === 'none' ? '❌ BLOCKED' : jlptConfig.accessType === 'all' ? '✅ ALLOWED' : '⚠️ RESTRICTED'
    });
  });
  
  // 4. Tổng kết
  console.log('\n📊 TỔNG KẾT:');
  const blockedLevels = levels.filter(levelId => {
    const config = levelConfigsParsed[levelId];
    return config && config.accessType === 'none';
  });
  const blockedJlptLevels = levels.filter(levelId => {
    const config = jlptConfigsParsed[levelId];
    return config && config.accessType === 'none';
  });
  
  console.log(`LEVEL - Blocked: ${blockedLevels.length} levels`, blockedLevels.length > 0 ? blockedLevels.map(l => l.toUpperCase()).join(', ') : 'None');
  console.log(`JLPT - Blocked: ${blockedJlptLevels.length} levels`, blockedJlptLevels.length > 0 ? blockedJlptLevels.map(l => l.toUpperCase()).join(', ') : 'None');
  
  return {
    levelModuleConfig: levelModuleConfig ? JSON.parse(levelModuleConfig) : null,
    jlptModuleConfig: jlptModuleConfig ? JSON.parse(jlptModuleConfig) : null,
    levelConfigs: levelConfigsParsed,
    jlptConfigs: jlptConfigsParsed,
    blockedLevels,
    blockedJlptLevels
  };
}

// Chạy ngay
const result = checkAccessConfig();
console.log('\n💾 Result saved to window.accessConfigResult');
window.accessConfigResult = result;

