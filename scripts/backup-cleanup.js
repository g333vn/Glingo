#!/usr/bin/env node

/**
 * Backup Cleanup Script
 * 
 * Dọn dẹp file backup cũ, chỉ giữ lại các bản gần nhất.
 * 
 * Usage:
 *   node scripts/backup-cleanup.js [--dry-run] [--keep-days=30]
 */

const fs = require('fs');
const path = require('path');

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
  projectBackupDir: path.join(__dirname, '..', 'data', 'backups'),
  externalBackupDir: process.env.BACKUP_DIR || 'D:\\Backups\\Elearning',
  keepDays: 30, // Giữ lại 30 ngày
  keepCount: 5, // Hoặc giữ lại 5 bản gần nhất
};

/**
 * Lấy danh sách tất cả file backup
 */
function getAllBackupFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        walkDir(itemPath);
      } else if (item.endsWith('.json') && item.includes('elearning')) {
        files.push({
          path: itemPath,
          name: item,
          size: stat.size,
          mtime: stat.mtime,
          age: Math.floor((Date.now() - stat.mtime.getTime()) / (1000 * 60 * 60 * 24)), // days
        });
      }
    });
  }
  
  walkDir(dir);
  return files;
}

/**
 * Xóa file cũ
 */
function cleanupBackups(backupDir, dryRun = false) {
  log(`\n🧹 Cleaning up: ${backupDir}`, 'cyan');
  
  const files = getAllBackupFiles(backupDir);
  
  if (files.length === 0) {
    log('   No backup files found', 'yellow');
    return { total: 0, deleted: 0, freed: 0 };
  }
  
  // Sắp xếp theo ngày (mới nhất trước)
  files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  
  // Giữ lại các file mới nhất
  const keepFiles = files.slice(0, CONFIG.keepCount);
  const oldFiles = files.slice(CONFIG.keepCount);
  
  // Lọc thêm: xóa file cũ hơn keepDays
  const toDelete = oldFiles.filter(file => file.age > CONFIG.keepDays);
  
  log(`   Total files: ${files.length}`, 'blue');
  log(`   Keeping: ${keepFiles.length} (newest)`, 'green');
  log(`   To delete: ${toDelete.length}`, 'yellow');
  
  let freed = 0;
  
  toDelete.forEach(file => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    log(`   ${dryRun ? '[DRY RUN]' : ''} Delete: ${file.name} (${file.age} days old, ${sizeMB} MB)`, 
        dryRun ? 'yellow' : 'red');
    
    if (!dryRun) {
      try {
        fs.unlinkSync(file.path);
        freed += file.size;
      } catch (error) {
        log(`   ✗ Error deleting ${file.name}: ${error.message}`, 'red');
      }
    } else {
      freed += file.size;
    }
  });
  
  const freedMB = (freed / 1024 / 1024).toFixed(2);
  log(`   ${dryRun ? 'Would free' : 'Freed'}: ${freedMB} MB`, 'cyan');
  
  return {
    total: files.length,
    deleted: toDelete.length,
    freed: freedMB,
  };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  
  // Parse keep-days
  const keepDaysArg = args.find(arg => arg.startsWith('--keep-days='));
  if (keepDaysArg) {
    CONFIG.keepDays = parseInt(keepDaysArg.split('=')[1]) || 30;
  }
  
  log('\n🧹 Backup Cleanup Script\n', 'bright');
  
  if (dryRun) {
    log('⚠️  DRY RUN MODE - No files will be deleted\n', 'yellow');
  }
  
  log(`📋 Configuration:`, 'cyan');
  log(`   Keep days: ${CONFIG.keepDays}`, 'blue');
  log(`   Keep count: ${CONFIG.keepCount}`, 'blue');
  
  // Cleanup Layer 1
  const result1 = cleanupBackups(CONFIG.projectBackupDir, dryRun);
  
  // Cleanup Layer 2
  const result2 = cleanupBackups(CONFIG.externalBackupDir, dryRun);
  
  // Tổng kết
  log('\n' + '='.repeat(60), 'bright');
  log('📊 Summary', 'bright');
  log('='.repeat(60), 'bright');
  log(`\nLayer 1 (data/backups/):`, 'cyan');
  log(`   Total: ${result1.total} files`, 'blue');
  log(`   Deleted: ${result1.deleted} files`, 'yellow');
  log(`   Freed: ${result1.freed} MB`, 'green');
  
  log(`\nLayer 2 (external):`, 'cyan');
  log(`   Total: ${result2.total} files`, 'blue');
  log(`   Deleted: ${result2.deleted} files`, 'yellow');
  log(`   Freed: ${result2.freed} MB`, 'green');
  
  const totalFreed = (parseFloat(result1.freed) + parseFloat(result2.freed)).toFixed(2);
  log(`\n💾 Total freed: ${totalFreed} MB`, 'bright');
  
  if (dryRun) {
    log('\n💡 Run without --dry-run to actually delete files', 'yellow');
  }
  
  log('\n✅ Cleanup completed!\n', 'green');
}

if (require.main === module) {
  main();
}

