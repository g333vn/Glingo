// scripts/i18n-migration.js
// i18n Migration Script - Convert hardcoded text to translation keys

const fs = require('fs');
const path = require('path');

// Common Vietnamese text patterns to detect
const VI_PATTERNS = [
  // Common words
  { pattern: /['"]Trang chủ['"]/g, key: 'common.home' },
  { pattern: /['"]Đăng nhập['"]/g, key: 'common.login' },
  { pattern: /['"]Đăng ký['"]/g, key: 'common.register' },
  { pattern: /['"]Đăng xuất['"]/g, key: 'common.logout' },
  { pattern: /['"]Lưu['"]/g, key: 'common.save' },
  { pattern: /['"]Hủy['"]/g, key: 'common.cancel' },
  { pattern: /['"]Sửa['"]/g, key: 'common.edit' },
  { pattern: /['"]Xóa['"]/g, key: 'common.delete' },
  { pattern: /['"]Đóng['"]/g, key: 'common.close' },
  { pattern: /['"]Tìm kiếm['"]/g, key: 'common.search' },
  
  // Lesson related
  { pattern: /['"]Bài học['"]/g, key: 'lesson.title' },
  { pattern: /['"]Lý thuyết['"]/g, key: 'lesson.theory' },
  { pattern: /['"]Quiz['"]/g, key: 'lesson.quiz' },
  { pattern: /['"]Đã học xong['"]/g, key: 'lesson.completed' },
  { pattern: /['"]Bắt đầu làm quiz['"]/g, key: 'lesson.startQuiz' },
  { pattern: /['"]Bài tiếp['"]/g, key: 'lesson.nextLesson' },
  { pattern: /['"]Bài trước['"]/g, key: 'lesson.previousLesson' },
  { pattern: /['"]Tải xuống['"]/g, key: 'lesson.download' },
  
  // Quiz related
  { pattern: /['"]Câu hỏi['"]/g, key: 'quiz.question' },
  { pattern: /['"]Nộp bài['"]/g, key: 'quiz.submit' },
  { pattern: /['"]Tiếp theo['"]/g, key: 'quiz.next' },
  { pattern: /['"]Đúng['"]/g, key: 'quiz.correct' },
  { pattern: /['"]Sai['"]/g, key: 'quiz.incorrect' },
  { pattern: /['"]Đáp án đúng['"]/g, key: 'quiz.correctAnswer' },
  { pattern: /['"]Giải thích['"]/g, key: 'quiz.explanation' },
  { pattern: /['"]Điểm của bạn['"]/g, key: 'quiz.yourScore' },
  { pattern: /['"]Thử lại['"]/g, key: 'quiz.tryAgain' },
  
  // Progress
  { pattern: /['"]Hoàn thành['"]/g, key: 'progress.completed' },
  { pattern: /['"]Đang học['"]/g, key: 'progress.inProgress' },
  { pattern: /['"]Chưa bắt đầu['"]/g, key: 'progress.notStarted' },
  { pattern: /['"]Chương['"]/g, key: 'progress.chapters' },
  { pattern: /['"]Điểm trung bình['"]/g, key: 'progress.averageScore' },
  { pattern: /['"]Điểm cao nhất['"]/g, key: 'progress.bestScore' },
  
  // Admin
  { pattern: /['"]Quản lý nội dung['"]/g, key: 'admin.contentManagement' },
  { pattern: /['"]Quản lý người dùng['"]/g, key: 'admin.userManagement' },
  { pattern: /['"]Quản lý đề thi['"]/g, key: 'admin.examManagement' },
  { pattern: /['"]Quản lý bài học['"]/g, key: 'admin.lessonsManagement' },
  { pattern: /['"]Thêm bài học['"]/g, key: 'admin.addLesson' },
  { pattern: /['"]Sửa bài học['"]/g, key: 'admin.editLesson' },
  { pattern: /['"]Xóa bài học['"]/g, key: 'admin.deleteLesson' },
  
  // Notifications
  { pattern: /['"]Đã lưu['"]/g, key: 'notification.saved' },
  { pattern: /['"]Đã xóa['"]/g, key: 'notification.deleted' },
  { pattern: /['"]Có lỗi xảy ra['"]/g, key: 'notification.error' },
];

// English patterns
const EN_PATTERNS = [
  { pattern: /['"]Home['"]/g, key: 'common.home' },
  { pattern: /['"]Login['"]/g, key: 'common.login' },
  { pattern: /['"]Register['"]/g, key: 'common.register' },
  { pattern: /['"]Logout['"]/g, key: 'common.logout' },
  { pattern: /['"]Save['"]/g, key: 'common.save' },
  { pattern: /['"]Cancel['"]/g, key: 'common.cancel' },
  { pattern: /['"]Edit['"]/g, key: 'common.edit' },
  { pattern: /['"]Delete['"]/g, key: 'common.delete' },
  { pattern: /['"]Close['"]/g, key: 'common.close' },
  { pattern: /['"]Search['"]/g, key: 'common.search' },
];

class I18nMigrationTool {
  constructor(srcDir = 'src') {
    this.srcDir = srcDir;
    this.findings = [];
    this.stats = {
      filesScanned: 0,
      matchesFound: 0,
      filesWithMatches: 0
    };
  }
  
  // Scan a single file
  scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileFindings = [];
    
    // Skip if file already imports useLanguage
    if (content.includes('useLanguage')) {
      return fileFindings;
    }
    
    // Check all patterns
    [...VI_PATTERNS, ...EN_PATTERNS].forEach(({ pattern, key }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Get line number
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          
          fileFindings.push({
            file: filePath,
            line: lineNumber,
            match: match,
            key: key,
            suggestion: `{t('${key}')}`
          });
        });
      }
    });
    
    return fileFindings;
  }
  
  // Scan directory recursively
  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, build
        if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
          this.scanDirectory(filePath);
        }
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        this.stats.filesScanned++;
        const findings = this.scanFile(filePath);
        
        if (findings.length > 0) {
          this.findings.push(...findings);
          this.stats.filesWithMatches++;
          this.stats.matchesFound += findings.length;
        }
      }
    });
  }
  
  // Generate report
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔄 i18n MIGRATION REPORT');
    console.log('='.repeat(80) + '\n');
    
    console.log('📊 STATISTICS:');
    console.log(`   Files scanned: ${this.stats.filesScanned}`);
    console.log(`   Files with matches: ${this.stats.filesWithMatches}`);
    console.log(`   Total matches found: ${this.stats.matchesFound}\n`);
    
    if (this.findings.length === 0) {
      console.log('✅ No hardcoded text found! All files are already using translations.\n');
      return;
    }
    
    // Group by file
    const byFile = {};
    this.findings.forEach(finding => {
      if (!byFile[finding.file]) {
        byFile[finding.file] = [];
      }
      byFile[finding.file].push(finding);
    });
    
    console.log('📝 FINDINGS BY FILE:\n');
    
    Object.keys(byFile).sort().forEach(file => {
      const findings = byFile[file];
      console.log(`\n📄 ${file} (${findings.length} matches):`);
      console.log('-'.repeat(80));
      
      findings.forEach((finding, index) => {
        console.log(`  ${index + 1}. Line ${finding.line}:`);
        console.log(`     Found: ${finding.match}`);
        console.log(`     Replace with: ${finding.suggestion}`);
        console.log(`     Key: ${finding.key}\n`);
      });
    });
    
    // Generate migration instructions
    console.log('\n' + '='.repeat(80));
    console.log('🔧 MIGRATION INSTRUCTIONS:');
    console.log('='.repeat(80) + '\n');
    
    const uniqueFiles = Object.keys(byFile);
    
    console.log('For each file, follow these steps:\n');
    console.log('1. Add import at the top:');
    console.log('   import { useLanguage } from \'../contexts/LanguageContext.jsx\';\n');
    console.log('2. In your component, add:');
    console.log('   const { t } = useLanguage();\n');
    console.log('3. Replace hardcoded text with t() calls as shown above.\n');
    
    // Save report to file
    const reportPath = 'i18n-migration-report.txt';
    let reportContent = '';
    
    reportContent += '='.repeat(80) + '\n';
    reportContent += 'i18n MIGRATION REPORT\n';
    reportContent += '='.repeat(80) + '\n\n';
    reportContent += `Files scanned: ${this.stats.filesScanned}\n`;
    reportContent += `Files with matches: ${this.stats.filesWithMatches}\n`;
    reportContent += `Total matches: ${this.stats.matchesFound}\n\n`;
    
    Object.keys(byFile).sort().forEach(file => {
      const findings = byFile[file];
      reportContent += `\n${file} (${findings.length} matches):\n`;
      reportContent += '-'.repeat(80) + '\n';
      
      findings.forEach((finding, index) => {
        reportContent += `  ${index + 1}. Line ${finding.line}: ${finding.match} → ${finding.suggestion}\n`;
      });
    });
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  }
  
  // Auto-migrate a file (experimental)
  autoMigrateFile(filePath, dryRun = true) {
    console.log(`\n🔄 ${dryRun ? 'DRY RUN' : 'MIGRATING'}: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Add import if not exists
    if (!content.includes('useLanguage')) {
      const importStatement = "import { useLanguage } from '../contexts/LanguageContext.jsx';\n";
      
      // Find where to insert (after last import)
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      lines.forEach((line, index) => {
        if (line.trim().startsWith('import ')) {
          lastImportIndex = index;
        }
      });
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
        content = lines.join('\n');
        modified = true;
        console.log('  ✓ Added useLanguage import');
      }
    }
    
    // Add const { t } = useLanguage(); to component
    if (!content.includes('const { t } = useLanguage()')) {
      // Find function component
      const functionMatch = content.match(/function\s+\w+\s*\([^)]*\)\s*{/);
      if (functionMatch) {
        const insertPos = content.indexOf(functionMatch[0]) + functionMatch[0].length;
        content = content.slice(0, insertPos) + '\n  const { t } = useLanguage();\n' + content.slice(insertPos);
        modified = true;
        console.log('  ✓ Added t() hook');
      }
    }
    
    // Replace patterns
    let replacements = 0;
    [...VI_PATTERNS, ...EN_PATTERNS].forEach(({ pattern, key }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, `{t('${key}')}`);
        replacements += matches.length;
        modified = true;
      }
    });
    
    if (replacements > 0) {
      console.log(`  ✓ Replaced ${replacements} text strings`);
    }
    
    if (modified) {
      if (!dryRun) {
        fs.writeFileSync(filePath, content);
        console.log('  ✅ File updated!');
      } else {
        console.log('  ℹ️  Dry run - no changes written');
      }
    } else {
      console.log('  ℹ️  No changes needed');
    }
    
    return modified;
  }
}

// CLI Usage
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const tool = new I18nMigrationTool('src');
  
  if (command === 'scan') {
    console.log('🔍 Scanning for hardcoded text...\n');
    tool.scanDirectory(tool.srcDir);
    tool.generateReport();
  } else if (command === 'migrate') {
    const filePath = args[1];
    const dryRun = !args.includes('--apply');
    
    if (!filePath) {
      console.error('❌ Please provide a file path: npm run i18n:migrate <file>');
      process.exit(1);
    }
    
    tool.autoMigrateFile(filePath, dryRun);
    
    if (dryRun) {
      console.log('\n💡 Tip: Add --apply flag to actually modify the file');
    }
  } else {
    console.log('i18n Migration Tool\n');
    console.log('Usage:');
    console.log('  npm run i18n:scan              - Scan all files for hardcoded text');
    console.log('  npm run i18n:migrate <file>    - Dry run migration for a file');
    console.log('  npm run i18n:migrate <file> --apply - Actually migrate the file\n');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = I18nMigrationTool;

