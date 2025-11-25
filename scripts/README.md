# 🔧 Scripts Documentation

## i18n Migration Tool

Công cụ tự động để migrate hardcoded text sang translation keys.

### 📋 Commands

#### 1. Scan for hardcoded text
```bash
npm run i18n:scan
```

Quét toàn bộ codebase và tạo report về các hardcoded text cần migrate.

**Output:**
- Console report với statistics
- File `i18n-migration-report.txt` với chi tiết đầy đủ

**Example output:**
```
📊 STATISTICS:
   Files scanned: 45
   Files with matches: 12
   Total matches found: 87

📝 FINDINGS BY FILE:

📄 src/pages/HomePage.jsx (8 matches):
  1. Line 25:
     Found: 'Trang chủ'
     Replace with: {t('common.home')}
     Key: common.home
```

#### 2. Dry run migration for a file
```bash
npm run i18n:migrate src/pages/HomePage.jsx
```

Preview changes that would be made without actually modifying the file.

**What it does:**
- Shows what imports would be added
- Shows what text would be replaced
- Displays number of changes

#### 3. Actually migrate a file
```bash
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

Actually perform the migration and modify the file.

**What it does:**
1. Adds `import { useLanguage } from '../contexts/LanguageContext.jsx';`
2. Adds `const { t } = useLanguage();` in component
3. Replaces hardcoded text with `{t('key')}`
4. Saves the modified file

### 🎯 Workflow Example

#### Step 1: Scan entire codebase
   ```bash
npm run i18n:scan
   ```

Review the report to see which files need migration.

#### Step 2: Migrate files one by one (dry run first)
   ```bash
# Dry run to preview changes
npm run i18n:migrate src/pages/HomePage.jsx

# If looks good, apply changes
npm run i18n:migrate src/pages/HomePage.jsx --apply
```

#### Step 3: Test the migrated file
- Run the app: `npm run dev`
- Navigate to the page
- Test language switching
- Verify all text displays correctly

#### Step 4: Repeat for other files
Continue with other files until all are migrated.

### 📝 Supported Patterns

The tool currently detects these Vietnamese patterns:

**Common:**
- Trang chủ → `common.home`
- Đăng nhập → `common.login`
- Đăng ký → `common.register`
- Lưu → `common.save`
- Hủy → `common.cancel`

**Lesson:**
- Bài học → `lesson.title`
- Lý thuyết → `lesson.theory`
- Quiz → `lesson.quiz`
- Đã học xong → `lesson.completed`

**Quiz:**
- Câu hỏi → `quiz.question`
- Đúng → `quiz.correct`
- Sai → `quiz.incorrect`

**And 50+ more patterns...**

### ⚙️ Customization

To add more patterns, edit `scripts/i18n-migration.js`:

```javascript
const VI_PATTERNS = [
  { pattern: /['"]Your Text['"]/g, key: 'category.key' },
  // Add more patterns here
];
```

### 🔍 What the tool does NOT do

- Does not handle template strings with variables (manual review needed)
- Does not migrate comments
- Does not handle complex JSX structures (needs manual review)
- Does not migrate text in inline styles

### 💡 Tips

1. **Always dry run first** - Review changes before applying
2. **Migrate one file at a time** - Easier to track and test
3. **Test after each migration** - Catch issues early
4. **Review the changes** - Tool is smart but not perfect
5. **Keep the report** - Use it as a checklist

### 🐛 Troubleshooting

**Issue: Import not added in the right place**
- Manually adjust the import position after migration

**Issue: `const { t }` added in wrong scope**
- Tool tries to add it after function declaration
- Manually move if needed

**Issue: False positives in report**
- Some matches might be in comments or strings that shouldn't be translated
- Review each match before applying

### 📊 Progress Tracking

After running `npm run i18n:scan`, you can track migration progress:

```
Total files to migrate: 12
Files completed: ___/12
Percentage: ___%
```

### 🎯 Priority Order

Suggested order for migration:

1. **Core pages** (HomePage, LevelPage, etc.)
2. **Shared components** (Header, Footer, Breadcrumbs)
3. **Feature pages** (LessonPage, QuizPage, etc.)
4. **Admin pages**
5. **Utility components**

---

## Other Scripts

### Backup Scripts
See `scripts/backup-*.js` for data backup automation.

### Auto Backup
```bash
node scripts/auto-backup.cjs
```

### Backup Cleanup
```bash
node scripts/backup-cleanup.cjs
```

---

**Made with ❤️ for easy i18n migration** 🌐
