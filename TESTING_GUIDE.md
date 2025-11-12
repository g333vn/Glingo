# 🧪 Testing Guide: Full localStorage System

## 🎯 Objective

Test the complete data flow: **Add → Save → Display** for Chapters and Quizzes.

---

## ✅ Test 1: Chapter Management

### Step 1: Add New Chapter
1. Navigate to `/login` → Login as admin (admin/admin123)
2. Navigate to `/admin/content`
3. Click tab "📚 Quản lý Sách"
4. Select Level: **N1**
5. Find a book (e.g., "SKM N1 Bunpou")
6. Click "➕" (Add Chapter) button
7. Fill form:
   - **ID**: `bai-test`
   - **Title**: `Bài Test: Chapter từ localStorage`
8. Click "💾 Lưu"

**Expected Result**:
- ✅ Alert: "Đã lưu chapter vào localStorage!"
- ✅ Chapter count increases by 1
- ✅ Table shows first 3 chapters including new one

### Step 2: Verify Chapter Appears on Book Page
1. Navigate to `/level/n1`
2. Find the same book and click it
3. Scroll to find the new chapter "Bài Test..."

**Expected Result**:
- ✅ New chapter card is visible in the grid
- ✅ Card displays title correctly
- ✅ Card is clickable

### Step 3: Edit Chapter
1. Go back to `/admin/content`
2. Find the book again
3. The chapter list now shows "Bài Test..." (if expanded)
4. Try creating another chapter to verify the system works

**Expected Result**:
- ✅ Can add multiple chapters
- ✅ Each chapter has unique ID
- ✅ All chapters persist after refresh

---

## ✅ Test 2: Quiz Management

### Step 1: Create New Quiz
1. Navigate to `/admin/quiz-editor`
2. Select location:
   - **Level**: N1
   - **Book**: Same book from Test 1
   - **Chapter**: `bai-test` (the chapter you just created)
3. Quiz title should auto-fill
4. Create 3 sample questions:
   - **Question 1**: "Test Question 1?"
   - **Options**: A: "Option A", B: "Option B", C: "Option C", D: "Option D"
   - **Correct**: A
   - **Explanation**: "This is option A"
   - *(Duplicate for questions 2 and 3)*
5. Click "💾 Lưu Quiz (localStorage)"

**Expected Result**:
- ✅ Alert: "Đã lưu quiz vào localStorage!"
- ✅ Alert shows location: Level N1, Book: ..., Chapter: bai-test
- ✅ Alert shows question count: 3

### Step 2: Verify Quiz Loads
1. Navigate to `/level/n1/{book-id}/lesson/bai-test`
2. Wait for page to load

**Expected Result**:
- ✅ Page shows "Bài Test: Chapter từ localStorage"
- ✅ Quiz displays 3 questions
- ✅ Can click through questions (Câu 1/3, Câu 2/3, Câu 3/3)
- ✅ Can select answers
- ✅ Can view explanations
- ✅ Quiz works normally

### Step 3: Test Quiz Priority
1. Open DevTools → Console
2. Look for log messages when quiz loads

**Expected Result**:
- ✅ Console shows: "✅ Loaded quiz from localStorage: {book-id}/bai-test"
- *(This confirms localStorage has highest priority)*

---

## ✅ Test 3: Storage Dashboard

### Step 1: Check Storage Stats
1. Navigate to `/admin` (Dashboard)
2. Scroll to "💾 LocalStorage Status" section

**Expected Result**:
- ✅ Shows Total Size (e.g., "2.5 MB")
- ✅ Shows Items count (e.g., "12")
- ✅ Shows Usage % (e.g., "50%")
- ✅ Progress bar displays correct percentage
- ✅ Progress bar color:
  - Green if < 50%
  - Yellow if 50-80%
  - Red if > 80%

### Step 2: Export Data
1. Click "📥 Export All Data"

**Expected Result**:
- ✅ File downloads: `elearning-backup-YYYY-MM-DD.json`
- ✅ Open file → Contains all data (books, series, chapters, quizzes)
- ✅ JSON is valid and readable

### Step 3: Refresh Stats
1. Click "🔄 Refresh"

**Expected Result**:
- ✅ Alert: "Đã refresh thông tin storage!"
- ✅ Stats update (if any changes)

---

## ✅ Test 4: Delete Chapter

### Step 1: Delete a Chapter
1. Navigate to `/admin/content`
2. Find the book with "bai-test" chapter
3. *(Note: Delete UI might not be fully implemented yet)*
4. If delete button exists, click it
5. Confirm deletion

**Expected Result**:
- ✅ Alert: "Đã xóa chapter!"
- ✅ Chapter count decreases
- ✅ Chapter no longer appears in book page

---

## ✅ Test 5: Clear All Data (⚠️ Destructive)

### Step 1: Clear Admin Data
1. Navigate to `/admin`
2. Click "🗑️ Clear All Admin Data"
3. Confirm the warning dialog

**Expected Result**:
- ✅ Confirmation dialog appears with warning
- ✅ Alert: "Đã xóa X items!"
- ✅ Storage stats reset (Total Size drops)
- ✅ Navigate to `/level/n1/{book-id}` → New chapters are gone (only static chapters remain)

### Step 2: Restore Data (If Needed)
1. *(Future feature: Import backup JSON)*
2. For now, you'll need to re-add chapters/quizzes manually

---

## 🔍 DevTools Inspection

### Check localStorage Manually
1. Open DevTools → Application (Chrome) / Storage (Firefox)
2. Navigate to **Local Storage** → `http://localhost:5173`
3. Look for keys starting with `admin`:

**Expected Keys**:
```
adminBooks_n1         → Books metadata
adminSeries_n1        → Series metadata
adminChapters_{bookId} → Chapters (e.g., adminChapters_skm-n1-bunpou)
adminQuiz_{bookId}_{chapterId} → Quizzes (e.g., adminQuiz_skm-n1-bunpou_bai-test)
```

4. Click on a key → See JSON data
5. Verify data structure matches expectations

---

## 🐛 Common Issues & Solutions

### Issue 1: "Quiz not found" or Loading Forever
**Cause**: Quiz ID mismatch
**Solution**:
- Check `bookId` and `lessonId` in URL match the saved quiz key
- Console log: `storageManager.getQuiz('bookId', 'lessonId')`

### Issue 2: Chapter Doesn't Appear
**Cause**: Book ID mismatch or page not refreshing
**Solution**:
- Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
- Check localStorage key: `adminChapters_{bookId}`
- Verify chapter ID matches exactly

### Issue 3: "Storage full" Error
**Cause**: localStorage limit exceeded (~5-10 MB)
**Solution**:
- Export data first
- Clear old/test data
- Use "Clear All Admin Data" button

### Issue 4: Data Lost After Browser Restart
**Cause**: Incognito mode or browser settings clearing storage
**Solution**:
- Use normal browsing mode
- Export data regularly as backup

---

## 📊 Success Criteria

All tests pass if:
- ✅ Can add chapters via UI → Visible immediately
- ✅ Can create quizzes via UI → Loads instantly
- ✅ Storage dashboard shows correct stats
- ✅ Export creates valid JSON backup
- ✅ Clear data removes all admin content
- ✅ Refresh preserves data (not incognito)

---

## 🎯 Next Steps (After Testing)

### If All Tests Pass:
1. ✅ Mark Phase 1-5 as COMPLETE
2. ✅ Proceed to Phase 6: JLPT Exam Management (optional)
3. ✅ Document any bugs/issues found

### If Tests Fail:
1. ❌ Document exact error messages
2. ❌ Check console logs
3. ❌ Inspect localStorage keys
4. ❌ Report to developer

---

## 💡 Tips

1. **Test in Order**: Follow Test 1 → Test 2 → Test 3 sequence
2. **Keep DevTools Open**: Monitor console for errors
3. **Export Before Clear**: Always backup before destructive operations
4. **Use Unique IDs**: Test chapters like `bai-test-1`, `bai-test-2` to avoid conflicts
5. **Refresh Often**: Hard refresh if data doesn't appear immediately

---

## 🚀 Ready to Test?

Start with **Test 1** and work your way through! Good luck! 🎉

