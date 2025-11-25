#!/usr/bin/env node

/**
 * 👀 Backup Watcher Script
 * 
 * Tự động theo dõi thư mục Downloads và tự động tổ chức file backup
 * khi có file mới được download.
 * 
 * Usage:
 *   node scripts/backup-watcher.js [--watch]
 *   node scripts/backup-watcher.js --once (chạy 1 lần rồi dừng)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { processBackupFile, findBackupFiles } = require('./backup-organizer.cjs');

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

const CONFIG = {
  downloadsDir: path.join(os.homedir(), 'Downloads'),
  checkInterval: 5000, // 5 seconds
  processedFiles: new Set(),
};

/**
 * Kiểm tra và xử lý file mới
 */
function checkForNewFiles() {
  const files = findBackupFiles(CONFIG.downloadsDir);
  
  files.forEach(file => {
    const filename = path.basename(file);
    
    // Bỏ qua file đã xử lý
    if (CONFIG.processedFiles.has(filename)) {
      return;
    }
    
    // Kiểm tra file đã hoàn tất download chưa (không còn đang write)
    try {
      const stats1 = fs.statSync(file);
      setTimeout(() => {
        const stats2 = fs.statSync(file);
        if (stats1.size === stats2.size && stats1.mtime.getTime() === stats2.mtime.getTime()) {
          // File đã hoàn tất download
          log(`\n🆕 New backup file detected: ${filename}`, 'cyan');
          processBackupFile(file);
          CONFIG.processedFiles.add(filename);
        }
      }, 2000); // Đợi 2 giây để đảm bảo file đã download xong
    } catch (error) {
      // File có thể đang được tạo, bỏ qua
    }
  });
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch') || args.includes('-w');
  const onceMode = args.includes('--once') || args.includes('-o');
  
  log('\n👀 Backup Watcher Started\n', 'bright');
  log(`📁 Watching: ${CONFIG.downloadsDir}`, 'cyan');
  
  if (watchMode) {
    log('🔄 Watch mode: ON (Press Ctrl+C to stop)\n', 'green');
    
    // Chạy ngay lần đầu
    checkForNewFiles();
    
    // Sau đó check định kỳ
    const interval = setInterval(() => {
      checkForNewFiles();
    }, CONFIG.checkInterval);
    
    // Xử lý Ctrl+C
    process.on('SIGINT', () => {
      log('\n\n👋 Watcher stopped', 'yellow');
      clearInterval(interval);
      process.exit(0);
    });
  } else if (onceMode) {
    log('🔍 Running once...\n', 'cyan');
    checkForNewFiles();
    log('\n✅ Done\n', 'green');
  } else {
    log('💡 Usage:', 'bright');
    log('   node scripts/backup-watcher.js --watch    (continuous watch)', 'cyan');
    log('   node scripts/backup-watcher.js --once    (run once)', 'cyan');
  }
}

if (require.main === module) {
  main();
}

