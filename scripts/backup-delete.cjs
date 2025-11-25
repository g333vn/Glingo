#!/usr/bin/env node

/**
 * 🗑️ Backup Delete Script
 * 
 * Xóa file backup cụ thể ở cả 3 layer (hoặc tất cả file)
 * 
 * Usage:
 *   node scripts/backup-delete.cjs [filename]     (xóa file cụ thể)
 *   node scripts/backup-delete.cjs --all           (xóa tất cả - nguy hiểm!)
 *   node scripts/backup-delete.cjs --dry-run      (xem trước, không xóa)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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
  
  // Layer 2: Folder riêng trên Windows
  externalBackupDir: process.env.BACKUP_DIR || 'E:\\Projects\\windows_elearning_data',
  
  // Layer 3: Cloud Storage folder - Drive
  cloudBackupDir: process.env.CLOUD_DIR || 'G:\\Drive của tôi\\drive_elearning_data',
};

/**
 * Tìm file trong thư mục (recursive)
 */
function findFileInDir(dir, filename) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  function walkDir(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          walkDir(itemPath);
        } else if (item === filename || item.includes(filename)) {
          files.push({
            path: itemPath,
            name: item,
            size: stat.size,
            mtime: stat.mtime,
          });
        }
      });
    } catch (error) {
      // Bỏ qua lỗi permission hoặc file không truy cập được
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Xóa file
 */
function deleteFile(filePath, dryRun = false) {
  try {
    if (dryRun) {
      log(`   [DRY RUN] Would delete: ${filePath}`, 'yellow');
      return true;
    }
    
    fs.unlinkSync(filePath);
    log(`   ✓ Deleted: ${filePath}`, 'green');
    return true;
  } catch (error) {
    log(`   ✗ Error deleting ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Xóa file cụ thể ở cả 3 layer
 */
function deleteSpecificFile(filename, dryRun = false) {
  log(`\n🗑️  Deleting file: ${filename}`, 'cyan');
  log(`   Mode: ${dryRun ? 'DRY RUN (preview only)' : 'DELETE'}`, dryRun ? 'yellow' : 'red');
  
  let totalFound = 0;
  let totalDeleted = 0;
  
  // Layer 1
  log(`\n📁 Layer 1: ${CONFIG.projectBackupDir}`, 'cyan');
  const files1 = findFileInDir(CONFIG.projectBackupDir, filename);
  totalFound += files1.length;
  files1.forEach(file => {
    if (deleteFile(file.path, dryRun)) {
      totalDeleted++;
    }
  });
  if (files1.length === 0) {
    log(`   No files found`, 'yellow');
  }
  
  // Layer 2
  log(`\n📁 Layer 2: ${CONFIG.externalBackupDir}`, 'cyan');
  const files2 = findFileInDir(CONFIG.externalBackupDir, filename);
  totalFound += files2.length;
  files2.forEach(file => {
    if (deleteFile(file.path, dryRun)) {
      totalDeleted++;
    }
  });
  if (files2.length === 0) {
    log(`   No files found`, 'yellow');
  }
  
  // Layer 3
  log(`\n📁 Layer 3: ${CONFIG.cloudBackupDir}`, 'cyan');
  const files3 = findFileInDir(CONFIG.cloudBackupDir, filename);
  totalFound += files3.length;
  files3.forEach(file => {
    if (deleteFile(file.path, dryRun)) {
      totalDeleted++;
    }
  });
  if (files3.length === 0) {
    log(`   No files found`, 'yellow');
  }
  
  // Tổng kết
  log(`\n` + '='.repeat(60), 'bright');
  log(`📊 Summary`, 'bright');
  log('='.repeat(60), 'bright');
  log(`   Files found: ${totalFound}`, 'blue');
  log(`   Files ${dryRun ? 'would be deleted' : 'deleted'}: ${totalDeleted}`, dryRun ? 'yellow' : 'green');
  
  if (dryRun) {
    log(`\n💡 Run without --dry-run to actually delete files`, 'yellow');
  }
  
  return { found: totalFound, deleted: totalDeleted };
}

/**
 * Xóa tất cả file backup (nguy hiểm!)
 */
function deleteAllBackups(dryRun = false) {
  log(`\n⚠️  WARNING: This will delete ALL backup files!`, 'red');
  log(`   Mode: ${dryRun ? 'DRY RUN (preview only)' : 'DELETE ALL'}`, dryRun ? 'yellow' : 'red');
  
  if (!dryRun) {
    log(`\n⚠️  Are you sure you want to delete ALL backup files?`, 'red');
    log(`   This action cannot be undone!`, 'red');
    log(`   Press Ctrl+C to cancel, or wait 5 seconds...`, 'yellow');
    
    // Đợi 5 giây để user có thể cancel
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = deleteAllBackupsInternal(dryRun);
        resolve(result);
      }, 5000);
    });
  }
  
  return deleteAllBackupsInternal(dryRun);
}

function deleteAllBackupsInternal(dryRun) {
  let totalFound = 0;
  let totalDeleted = 0;
  let totalSize = 0;
  
  // Helper function để xóa tất cả file trong thư mục
  function deleteAllInDir(dir) {
    if (!fs.existsSync(dir)) {
      return { found: 0, deleted: 0, size: 0 };
    }
    
    let found = 0;
    let deleted = 0;
    let size = 0;
    
    function walkDir(currentDir) {
      try {
        const items = fs.readdirSync(currentDir);
        
        items.forEach(item => {
          const itemPath = path.join(currentDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            const result = walkDir(itemPath);
            found += result.found;
            deleted += result.deleted;
            size += result.size;
          } else if (item.endsWith('.json') && item.includes('elearning')) {
            found++;
            size += stat.size;
            if (deleteFile(itemPath, dryRun)) {
              deleted++;
            }
          }
        });
      } catch (error) {
        // Bỏ qua lỗi
      }
    }
    
    walkDir(dir);
    return { found, deleted, size };
  }
  
  // Layer 1
  log(`\n📁 Layer 1: ${CONFIG.projectBackupDir}`, 'cyan');
  const result1 = deleteAllInDir(CONFIG.projectBackupDir);
  totalFound += result1.found;
  totalDeleted += result1.deleted;
  totalSize += result1.size;
  log(`   Found: ${result1.found} files`, 'blue');
  
  // Layer 2
  log(`\n📁 Layer 2: ${CONFIG.externalBackupDir}`, 'cyan');
  const result2 = deleteAllInDir(CONFIG.externalBackupDir);
  totalFound += result2.found;
  totalDeleted += result2.deleted;
  totalSize += result2.size;
  log(`   Found: ${result2.found} files`, 'blue');
  
  // Layer 3
  log(`\n📁 Layer 3: ${CONFIG.cloudBackupDir}`, 'cyan');
  const result3 = deleteAllInDir(CONFIG.cloudBackupDir);
  totalFound += result3.found;
  totalDeleted += result3.deleted;
  totalSize += result3.size;
  log(`   Found: ${result3.found} files`, 'blue');
  
  // Tổng kết
  log(`\n` + '='.repeat(60), 'bright');
  log(`📊 Summary`, 'bright');
  log('='.repeat(60), 'bright');
  log(`   Total files found: ${totalFound}`, 'blue');
  log(`   Total files ${dryRun ? 'would be deleted' : 'deleted'}: ${totalDeleted}`, dryRun ? 'yellow' : 'green');
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
  log(`   Total size: ${sizeMB} MB`, 'cyan');
  
  if (dryRun) {
    log(`\n💡 Run without --dry-run to actually delete files`, 'yellow');
  } else {
    log(`\n⚠️  All backup files have been deleted!`, 'red');
  }
  
  return { found: totalFound, deleted: totalDeleted, size: totalSize };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const deleteAll = args.includes('--all') || args.includes('-a');
  
  log('\n🗑️  Backup Delete Script\n', 'bright');
  
  if (deleteAll) {
    // Xóa tất cả
    if (dryRun) {
      deleteAllBackups(true);
    } else {
      deleteAllBackups(false).then(() => {
        log('\n✅ Delete operation completed!\n', 'green');
      });
    }
  } else if (args.length === 0 || args[0].startsWith('--')) {
    // Không có filename
    log('💡 Usage:', 'bright');
    log('   node scripts/backup-delete.cjs [filename]     (delete specific file)', 'cyan');
    log('   node scripts/backup-delete.cjs --all          (delete all files - DANGEROUS!)', 'red');
    log('   node scripts/backup-delete.cjs --dry-run      (preview only)', 'yellow');
    log('\nExamples:', 'bright');
    log('   node scripts/backup-delete.cjs elearning-backup-all-2025-01-19_10-30-45.json', 'cyan');
    log('   node scripts/backup-delete.cjs elearning-backup-all-2025-01-19_10-30-45.json --dry-run', 'yellow');
    log('   node scripts/backup-delete.cjs --all --dry-run', 'yellow');
  } else {
    // Xóa file cụ thể
    const filename = args.find(arg => !arg.startsWith('--'));
    if (filename) {
      const result = deleteSpecificFile(filename, dryRun);
      if (!dryRun && result.deleted > 0) {
        log('\n✅ Delete operation completed!\n', 'green');
      } else if (dryRun) {
        log('\n💡 Run without --dry-run to actually delete files\n', 'yellow');
      } else {
        log('\n⚠️  No files were deleted\n', 'yellow');
      }
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { deleteSpecificFile, deleteAllBackups };

