#!/usr/bin/env node

/**
 * 📦 Backup Organizer Script
 * 
 * Tự động tổ chức file backup vào 3 nơi:
 * 1. data/backups/ (trong project)
 * 2. D:\Backups\Elearning\ (folder riêng)
 * 3. Cloud Storage (hướng dẫn upload)
 * 
 * Usage:
 *   node scripts/backup-organizer.js [source-file]
 *   node scripts/backup-organizer.js --auto (tự động tìm trong Downloads)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const CONFIG = {
  // Layer 1: Trong project
  projectBackupDir: path.join(__dirname, '..', 'data', 'backups'),
  
  // Layer 2: Folder riêng (có thể thay đổi)
  externalBackupDir: process.env.BACKUP_DIR || 'D:\\Backups\\Elearning',
  
  // Layer 3: Cloud Storage folder (hướng dẫn)
  cloudBackupDir: process.env.CLOUD_DIR || path.join(os.homedir(), 'Google Drive', 'Elearning Backups'),
  
  // Downloads folder
  downloadsDir: path.join(os.homedir(), 'Downloads'),
  
  // File patterns để tìm backup files
  backupPatterns: [
    /elearning.*backup.*\.json$/i,
    /elearning.*export.*\.json$/i,
  ],
};

/**
 * Tạo cấu trúc thư mục theo ngày
 */
function createDateStructure(baseDir) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const date = `${yearMonth}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yearMonthDir = path.join(baseDir, yearMonth);
  const dateDir = path.join(yearMonthDir, date);
  
  // Tạo thư mục nếu chưa có
  [yearMonthDir, dateDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✓ Created directory: ${dir}`, 'green');
    }
  });
  
  return dateDir;
}

/**
 * Xác định loại backup từ tên file
 */
function getBackupType(filename) {
  const name = filename.toLowerCase();
  
  if (name.includes('all') || name.includes('backup-all')) {
    return 'all';
  } else if (name.includes('n1') || name.includes('n2') || name.includes('n3') || 
             name.includes('n4') || name.includes('n5')) {
    const match = name.match(/n[1-5]/);
    return match ? match[0] : 'level';
  } else if (name.includes('series')) {
    return 'series';
  } else if (name.includes('book')) {
    return 'book';
  } else if (name.includes('chapter')) {
    return 'chapter';
  } else if (name.includes('lesson')) {
    return 'lesson';
  } else if (name.includes('quiz')) {
    return 'quiz';
  } else if (name.includes('exam')) {
    return 'exam';
  }
  
  return 'other';
}

/**
 * Copy file vào thư mục đích với cấu trúc tổ chức
 */
function copyToBackup(sourceFile, targetDir, backupType) {
  const filename = path.basename(sourceFile);
  const dateDir = createDateStructure(targetDir);
  
  // Tạo thư mục con theo loại backup (nếu cần)
  let finalDir = dateDir;
  if (backupType !== 'all' && backupType !== 'other') {
    finalDir = path.join(dateDir, backupType);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
  }
  
  const targetFile = path.join(finalDir, filename);
  
  // Copy file
  fs.copyFileSync(sourceFile, targetFile);
  
  return targetFile;
}

/**
 * Tìm file backup trong Downloads
 */
function findBackupFiles(downloadsDir) {
  if (!fs.existsSync(downloadsDir)) {
    log(`⚠ Downloads directory not found: ${downloadsDir}`, 'yellow');
    return [];
  }
  
  const files = fs.readdirSync(downloadsDir);
  const backupFiles = files
    .filter(file => {
      const fullPath = path.join(downloadsDir, file);
      if (!fs.statSync(fullPath).isFile()) return false;
      
      return CONFIG.backupPatterns.some(pattern => pattern.test(file));
    })
    .map(file => path.join(downloadsDir, file));
  
  return backupFiles;
}

/**
 * Xử lý một file backup
 */
function processBackupFile(sourceFile) {
  const filename = path.basename(sourceFile);
  const fileSize = (fs.statSync(sourceFile).size / 1024 / 1024).toFixed(2); // MB
  const backupType = getBackupType(filename);
  
  log(`\n📦 Processing: ${filename} (${fileSize} MB)`, 'cyan');
  log(`   Type: ${backupType}`, 'blue');
  
  // Layer 1: Copy vào data/backups/
  try {
    const target1 = copyToBackup(sourceFile, CONFIG.projectBackupDir, backupType);
    log(`   ✓ Layer 1: ${target1}`, 'green');
  } catch (error) {
    log(`   ✗ Layer 1 failed: ${error.message}`, 'red');
  }
  
  // Layer 2: Copy vào folder riêng
  try {
    // Tạo thư mục nếu chưa có
    if (!fs.existsSync(CONFIG.externalBackupDir)) {
      fs.mkdirSync(CONFIG.externalBackupDir, { recursive: true });
      log(`   ✓ Created external backup directory: ${CONFIG.externalBackupDir}`, 'green');
    }
    
    const target2 = copyToBackup(sourceFile, CONFIG.externalBackupDir, backupType);
    log(`   ✓ Layer 2: ${target2}`, 'green');
  } catch (error) {
    log(`   ✗ Layer 2 failed: ${error.message}`, 'red');
    log(`   💡 Tip: Create folder manually: ${CONFIG.externalBackupDir}`, 'yellow');
  }
  
  // Layer 3: Hướng dẫn upload lên cloud
  log(`   ℹ Layer 3: Upload to Cloud Storage manually`, 'yellow');
  log(`      → Copy to: ${CONFIG.cloudBackupDir}`, 'blue');
  
  return {
    filename,
    fileSize,
    backupType,
    layer1: path.join(CONFIG.projectBackupDir, '...'),
    layer2: path.join(CONFIG.externalBackupDir, '...'),
    layer3: CONFIG.cloudBackupDir,
  };
}

/**
 * Main function
 */
function main() {
  log('\n📦 Backup Organizer - 3 Layer Backup System\n', 'bright');
  
  const args = process.argv.slice(2);
  let sourceFiles = [];
  
  // Xử lý arguments
  if (args.length === 0 || args[0] === '--auto' || args[0] === '-a') {
    // Tự động tìm trong Downloads
    log('🔍 Searching for backup files in Downloads...', 'cyan');
    sourceFiles = findBackupFiles(CONFIG.downloadsDir);
    
    if (sourceFiles.length === 0) {
      log('⚠ No backup files found in Downloads', 'yellow');
      log(`   Looking in: ${CONFIG.downloadsDir}`, 'blue');
      log('\n💡 Usage:', 'bright');
      log('   node scripts/backup-organizer.js [file-path]', 'cyan');
      log('   node scripts/backup-organizer.js --auto', 'cyan');
      return;
    }
    
    log(`✓ Found ${sourceFiles.length} backup file(s)`, 'green');
  } else {
    // File được chỉ định
    const filePath = path.resolve(args[0]);
    if (!fs.existsSync(filePath)) {
      log(`✗ File not found: ${filePath}`, 'red');
      return;
    }
    sourceFiles = [filePath];
  }
  
  // Xử lý từng file
  const results = [];
  sourceFiles.forEach(file => {
    try {
      const result = processBackupFile(file);
      results.push(result);
    } catch (error) {
      log(`✗ Error processing ${file}: ${error.message}`, 'red');
    }
  });
  
  // Tổng kết
  log('\n' + '='.repeat(60), 'bright');
  log('📊 Summary', 'bright');
  log('='.repeat(60), 'bright');
  
  results.forEach((result, index) => {
    log(`\n${index + 1}. ${result.filename}`, 'cyan');
    log(`   Size: ${result.fileSize} MB`, 'blue');
    log(`   Type: ${result.backupType}`, 'blue');
    log(`   ✓ Layer 1: data/backups/`, 'green');
    log(`   ✓ Layer 2: ${CONFIG.externalBackupDir}`, 'green');
    log(`   ⚠ Layer 3: Upload manually to Cloud Storage`, 'yellow');
  });
  
  // Hướng dẫn Cloud Storage
  log('\n' + '='.repeat(60), 'bright');
  log('☁️  Cloud Storage Upload Guide', 'bright');
  log('='.repeat(60), 'bright');
  log('\nTo complete Layer 3 backup:', 'cyan');
  log(`1. Open: ${CONFIG.cloudBackupDir}`, 'blue');
  log('2. Copy the backup files from Layer 2', 'blue');
  log('3. Files will auto-sync to cloud', 'blue');
  log('\nOr use Google Drive/Dropbox web interface', 'yellow');
  
  // Hỏi có muốn xóa file gốc không
  if (sourceFiles.length > 0 && sourceFiles[0].includes(CONFIG.downloadsDir)) {
    log('\n💡 Tip: You can delete original files from Downloads after backup', 'yellow');
  }
  
  log('\n✅ Backup organization completed!\n', 'green');
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { processBackupFile, findBackupFiles };

