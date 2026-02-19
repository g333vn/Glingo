#!/usr/bin/env node

/**
 *  Auto Backup Script
 * 
 * Script tự động chạy backup organizer mỗi ngày/tuần
 * Dùng với Windows Task Scheduler để tự động hóa hoàn toàn
 * 
 * Usage:
 *   node scripts/auto-backup.cjs
 *   node scripts/auto-backup.cjs --cleanup (chạy cleanup luôn)
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Get script directory
const scriptDir = path.join(__dirname);
const projectRoot = path.join(scriptDir, '..');
const organizerScript = path.join(scriptDir, 'backup-organizer.cjs');
const cleanupScript = path.join(scriptDir, 'backup-cleanup.cjs');

// Log file
const logFile = path.join(projectRoot, 'data', 'backups', 'auto-backup.log');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Đảm bảo thư mục tồn tại
  const logDir = path.dirname(logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Ghi log (append)
  fs.appendFileSync(logFile, logMessage, 'utf8');
}

function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const command = `node "${scriptPath}" ${args.join(' ')}`;
    
    log(`\n🚀 Running: ${command}`, 'cyan');
    writeLog(`Running: ${command}`);
    
    exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Error: ${error.message}`, 'red');
        writeLog(`Error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stdout) {
        console.log(stdout);
        writeLog(stdout);
      }
      
      if (stderr) {
        console.error(stderr);
        writeLog(`Stderr: ${stderr}`);
      }
      
      resolve(stdout);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const runCleanup = args.includes('--cleanup') || args.includes('-c');
  
  log('\n🤖 Auto Backup Script Started\n', 'bright');
  writeLog('Auto Backup Script Started');
  
  try {
    // 1. Chạy backup organizer
    log('📦 Step 1: Organizing backup files...', 'cyan');
    await runScript(organizerScript, ['--auto']);
    log('✅ Backup organization completed', 'green');
    
    // 2. Chạy cleanup (nếu được yêu cầu)
    if (runCleanup) {
      log('\n🧹 Step 2: Cleaning up old backups...', 'cyan');
      await runScript(cleanupScript);
      log('✅ Cleanup completed', 'green');
    }
    
    log('\n✅ Auto backup completed successfully!\n', 'green');
    writeLog('Auto backup completed successfully');
    
  } catch (error) {
    log(`\n❌ Auto backup failed: ${error.message}\n`, 'red');
    writeLog(`Auto backup failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

