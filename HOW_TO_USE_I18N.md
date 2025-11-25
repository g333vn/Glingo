# 🎯 Cách Sử Dụng i18n Trong App

## ✅ Đã Hoàn Thành

### 1. **Header Component** ✅
Đã migrate thành công! Về trang Home và test ngay:

```
http://localhost:5173/
```

**What's translated:**
- ✅ HOME → Trang chủ / Home / ホーム
- ✅ LEVEL → Cấp độ / Level / レベル  
- ✅ ABOUT → Giới thiệu / About / 紹介
- ✅ Login/Register buttons
- ✅ Logout button
- ✅ Admin Panel / Editor Panel

**Test Steps:**
1. Về trang Home
2. Click vào 🇻🇳 VN button (top-right)
3. Chọn English hoặc Japanese
4. **Text trong menu sẽ đổi ngay!**

---

## 🎓 Cách Migrate Components Khác

### **Template: 3 Bước Đơn Giản**

#### Bước 1: Import `useLanguage`

```jsx
// At the top of your component
import { useLanguage } from '../contexts/LanguageContext.jsx';
```

#### Bước 2: Get `t` function

```jsx
function MyComponent() {
  const { t } = useLanguage();
  
  // ... rest of component
}
```

#### Bước 3: Replace hardcoded text

```jsx
// ❌ Before
<button>Đăng nhập</button>

// ✅ After
<button>{t('common.login')}</button>
```

---

## 📚 Translation Keys Có Sẵn

### **Common (Dùng nhiều nhất)**

```javascript
t('common.home')       // Trang chủ / Home / ホーム
t('common.login')      // Đăng nhập / Login / ログイン
t('common.register')   // Đăng ký / Register / 登録
t('common.logout')     // Đăng xuất / Logout / ログアウト
t('common.save')       // Lưu / Save / 保存
t('common.cancel')     // Hủy / Cancel / キャンセル
t('common.edit')       // Sửa / Edit / 編集
t('common.delete')     // Xóa / Delete / 削除
t('common.search')     // Tìm kiếm / Search / 検索
t('common.close')      // Đóng / Close / 閉じる
```

### **Lesson**

```javascript
t('lesson.title')      // Bài học / Lesson / レッスン
t('lesson.theory')     // Lý thuyết / Theory / 理論
t('lesson.quiz')       // Quiz / Quiz / クイズ
t('lesson.completed')  // Đã học xong / Completed / 完了
t('lesson.startQuiz')  // Bắt đầu làm quiz / Start Quiz / クイズを始める
```

### **Quiz**

```javascript
t('quiz.question')     // Câu hỏi / Question / 質問
t('quiz.submit')       // Nộp bài / Submit / 提出
t('quiz.next')         // Tiếp theo / Next / 次へ
t('quiz.correct')      // Đúng / Correct / 正解
t('quiz.incorrect')    // Sai / Incorrect / 不正解
```

### **With Parameters**

```javascript
// With {count} parameter
t('header.streakDays', { count: 7 })
// → "7 ngày liên tiếp" / "7 day streak" / "7日連続"

t('search.resultsFound', { count: 42 })
// → "Tìm thấy 42 kết quả" / "Found 42 results" / "42個の結果"
```

---

## 🎯 Ưu Tiên Migrate

### **Priority 1: Components quan trọng nhất** ⭐⭐⭐
1. ✅ Header (DONE!)
2. Footer
3. LoginModal
4. HomePage

### **Priority 2: Feature pages** ⭐⭐
5. LessonPage
6. QuizPage  
7. BookDetailPage
8. LevelPage

### **Priority 3: Admin pages** ⭐
9. AdminDashboardPage
10. ContentManagementPage
11. Other admin pages

---

## 📝 Example: Migrate HomePage

### Before (Hardcoded):
```jsx
function HomePage() {
  return (
    <div>
      <h1>Chào mừng đến E-Learning</h1>
      <p>Nền tảng học tiếng Nhật</p>
      <button>Bắt đầu học</button>
    </div>
  );
}
```

### After (i18n):
```jsx
import { useLanguage } from '../contexts/LanguageContext.jsx';

function HomePage() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.welcome')}</h1>
      <p>{t('home.platform')}</p>
      <button>{t('home.startLearning')}</button>
    </div>
  );
}
```

### Add Translation Keys:
```javascript
// src/translations/vi.js
home: {
  welcome: 'Chào mừng đến E-Learning',
  platform: 'Nền tảng học tiếng Nhật',
  startLearning: 'Bắt đầu học'
}

// src/translations/en.js
home: {
  welcome: 'Welcome to E-Learning',
  platform: 'Japanese Learning Platform',
  startLearning: 'Start Learning'
}

// src/translations/ja.js
home: {
  welcome: 'E-Learningへようこそ',
  platform: '日本語学習プラットフォーム',
  startLearning: '学習を始める'
}
```

---

## 🛠️ Cách Thêm Translation Keys Mới

### Step 1: Identify the text

```jsx
// You have this hardcoded text:
<button>Xác nhận</button>
```

### Step 2: Choose a category and key

```
Category: common (buttons/actions)
Key: confirm
Full path: common.confirm
```

### Step 3: Add to ALL 3 language files

```javascript
// src/translations/vi.js
common: {
  // ... existing keys
  confirm: 'Xác nhận'
}

// src/translations/en.js
common: {
  // ... existing keys
  confirm: 'Confirm'
}

// src/translations/ja.js
common: {
  // ... existing keys
  confirm: '確認'
}
```

### Step 4: Use in component

```jsx
<button>{t('common.confirm')}</button>
```

---

## 🚀 Quick Start Checklist

```markdown
### Test Header (Already Done!)
- [ ] Go to http://localhost:5173/
- [ ] Click language switcher (🇻🇳 VN ▼)
- [ ] Select English
- [ ] Menu text changes to English ✅
- [ ] Select Japanese  
- [ ] Menu text changes to Japanese ✅

### Next: Migrate Footer
- [ ] Open src/components/Footer.jsx
- [ ] Add: import { useLanguage } from '../contexts/LanguageContext.jsx';
- [ ] Add: const { t } = useLanguage();
- [ ] Replace hardcoded text với {t('key')}
- [ ] Test trên browser

### Then: Migrate HomePage
- [ ] Open src/pages/HomePage.jsx
- [ ] Same steps as Footer
- [ ] Add new keys if needed
- [ ] Test
```

---

## 💡 Tips

### 1. **Always Use Full Path**
```jsx
// ✅ Good
{t('common.home')}
{t('lesson.title')}

// ❌ Bad
{t('home')}  // Missing category
```

### 2. **Check Console for Missing Keys**
```
⚠️ [i18n] Translation missing for key: common.unknownKey
```

### 3. **Uppercase When Needed**
```jsx
// For menu items that are UPPERCASE
{t('common.home').toUpperCase()}  // HOME
```

### 4. **Add Keys Before Using**
Always add the key to **all 3 files** (vi, en, ja) before using it!

### 5. **Test After Each Migration**
- Switch languages after migrating each component
- Verify text changes correctly
- Check layout doesn't break

---

## 🎨 Current Status

### ✅ Working
- Translation system (100%)
- Language switcher UI (100%)
- Header component (100%)
- Test pages (debug-i18n, test-i18n-simple)

### 📝 To Do
- Footer component
- HomePage
- LessonPage  
- QuizPage
- Admin pages
- ... (other components)

---

## 🔗 Test URLs

```
Main app with translated Header:
http://localhost:5173/

Debug page (full testing):
http://localhost:5173/debug-i18n

Simple test:
http://localhost:5173/test-i18n-simple
```

---

## 📞 Need Help?

### Common Issues

**Q: Text không đổi khi switch language?**
- Check xem đã add `const { t } = useLanguage()` chưa
- Check console có warnings không
- Verify key exists trong translation files

**Q: Hiển thị nguyên key (vd: "common.home")?**
- Key không tồn tại trong translation file
- Check spelling của key
- Add key vào cả 3 files

**Q: Làm sao biết key nào available?**
- Xem file `src/translations/vi.js` (complete list)
- Hoặc check `docs/features/I18N_SYSTEM_DOCUMENTATION.md`

---

**Made with ❤️ for easy i18n** 🌐

**Current Status:** Header is WORKING! Test it now! 🎉

