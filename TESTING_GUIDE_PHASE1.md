# 🧪 Testing Guide - SRS Phase 1

## Hướng Dẫn Test Phase 1 Integration

Phase 1 đã integrate xong! Đây là guide để test đầy đủ trước khi deploy production.

---

## 🚀 Setup Test Environment

### 1. Start Dev Server

```bash
# Terminal 1: Start development server
npm run dev

# Terminal 2 (optional): Watch for errors
npm run dev 2>&1 | grep -i "error"
```

Server should start at: `http://localhost:5173`

### 2. Open Browser DevTools

**Chrome/Edge:**
- Press `F12` or `Ctrl+Shift+I`
- Go to **Console** tab (check for errors)
- Go to **Application** → **IndexedDB** (check data)

### 3. Login as Admin

- Username: `admin` (or your admin account)
- Password: Your password
- Navigate: **Admin Panel** → **Quản lý Bài học**

---

## ✅ Test Cases

### Test 1: Create New Lesson with SRS ⭐

**Goal:** Verify new lesson với SRS settings saves correctly

**Steps:**

1. **Navigate to HierarchyView**
   - Click "Books" section
   - Find any book (e.g., "Demo Complete Book")
   - Click expand → Find a chapter
   - Click "Add Lesson" button

2. **Fill Basic Info**
   - ContentType: Select **"📚 Từ vựng (Vocabulary)"**
   - Verify badges show: [📖 LÝ THUYẾT] [🎴 FLASHCARD SRS] [📊 QUIZ]
   - ID: `test-srs-001` (or auto-generated)
   - Title: `Test SRS Lesson`
   - Description: `Testing Phase 1 integration`
   - Check: ☑️ Xuất bản ngay

3. **Theory Tab**
   - Click **[📄 PDF Document]** button
   - PDF URL: `/pdfs/test.pdf` (or any existing PDF)
   - Check: ☑️ Cho phép download
   - (Optional) Click **[📝 HTML Content]** → Test HTML input

4. **Flashcard Tab**
   - Check: ☑️ Bật Flashcard SRS
   - Verify deck ID shows: `deck-test-srs-001` (auto-generated)
   - New cards/day: Leave default `20` or change
   - Reviews/day: Leave default `100` or change

5. **Save**
   - Click **💾 Tạo Bài học**
   - Wait for success alert
   - Should see: "✅ ĐÃ LƯU THÀNH CÔNG!"
   - Alert should show: "SRS: BẬT ✅"

6. **Verify in Console**
```javascript
// Should see in browser console:
💾 Saving lesson: {
  format: "NEW (SRS-enabled)",
  id: "test-srs-001",
  contentType: "vocabulary",
  hasSRS: true
}
```

7. **Verify in IndexedDB**
   - DevTools → Application → IndexedDB
   - Database: `elearning_db`
   - Store: `lessons`
   - Find key: `n1_[bookId]_[chapterId]`
   - Click to expand → Find your lesson
   - Verify structure:
```json
{
  "id": "test-srs-001",
  "title": "Test SRS Lesson",
  "contentType": "vocabulary",
  "theory": {
    "pdfUrl": "/pdfs/test.pdf",
    "allowDownload": true
  },
  "srs": {
    "enabled": true,
    "deckId": "deck-test-srs-001",
    "cardCount": 0,
    "newCardsPerDay": 20
  }
}
```

**Expected Result:** ✅ Lesson saved with new structure

---

### Test 2: Edit Old Lesson (Auto-Migration) ⭐⭐

**Goal:** Verify old lessons auto-migrate to new format

**Steps:**

1. **Find Old Lesson**
   - Look for lesson created BEFORE SRS integration
   - Should have old structure: `{ id, title, pdfUrl, content }`
   - Example: "Demo Complete Book" → Any existing lesson

2. **Click Edit**
   - Click "✏️" button on old lesson
   - Modal should open

3. **Check Console Log**
```javascript
// Should see:
📦 Auto-migrated old lesson to new format: {
  id: "lesson-1",
  oldFormat: { 
    pdfUrl: "/pdfs/old.pdf", 
    content: "<div>...</div>" 
  },
  newFormat: {
    contentType: "grammar",
    theory: { 
      pdfUrl: "/pdfs/old.pdf", 
      htmlContent: "<div>...</div>" 
    },
    srs: { enabled: false }
  }
}
```

4. **Verify Modal Content**
   - ContentType: Should show "📖 Ngữ pháp" (auto-detected)
   - ID: Read-only (old ID preserved)
   - Title: Should show old title
   - Theory tab: Should show old PDF URL / HTML
   - Flashcard tab: SRS disabled (default)

5. **Optional: Enable SRS**
   - Switch to Flashcard tab
   - Check: ☑️ Bật Flashcard SRS
   - Change content type if needed

6. **Save**
   - Click **💾 Lưu thay đổi**
   - Should see success alert

7. **Verify in IndexedDB**
   - Old lesson should now have new structure
   - Old data preserved in `theory.pdfUrl`, `theory.htmlContent`
   - New fields added: `contentType`, `srs`, `stats`

**Expected Result:** ✅ Old lesson migrated, data preserved

---

### Test 3: Create Grammar Lesson (No SRS)

**Goal:** Verify non-vocabulary lessons don't enable SRS by default

**Steps:**

1. Create new lesson
2. ContentType: Select **"📖 Ngữ pháp (Grammar)"**
3. Verify badges: Only [📖 LÝ THUYẾT] [📊 QUIZ] (no SRS)
4. Fill Theory tab (PDF/HTML)
5. Flashcard tab: Should show "Flashcard SRS chưa được bật"
6. Save
7. Verify: `srs.enabled === false` in IndexedDB

**Expected Result:** ✅ Grammar lesson without SRS

---

### Test 4: Switch ContentType

**Goal:** Verify switching types updates tabs correctly

**Steps:**

1. Create new lesson
2. Start with "Grammar" → Only Theory + Quiz tabs
3. Switch to "Vocabulary" → Theory + Flashcard + Quiz tabs appear
4. Switch to "Kanji" → All tabs available
5. Switch back to "Grammar" → Flashcard tab disabled again
6. Fill Theory tab → Switch type → Data should persist
7. Save any type → Should work

**Expected Result:** ✅ Dynamic tabs based on content type

---

### Test 5: Tab Navigation

**Goal:** Verify tabs switch smoothly without losing data

**Steps:**

1. Create new lesson (Vocabulary type)
2. **Theory Tab:**
   - Fill PDF URL: `/pdfs/test.pdf`
   - Switch to HTML input
   - Fill HTML: `<h2>Test</h2>`
   - Click preview → Should render

3. **Switch to Flashcard Tab:**
   - Enable SRS
   - Change cards/day: `30`
   - Change reviews/day: `150`

4. **Switch back to Theory Tab:**
   - Verify PDF URL still there
   - Verify HTML still there

5. **Switch to Quiz Tab:**
   - Should show "Coming Soon" message

6. **Save:**
   - All data from all tabs should save

**Expected Result:** ✅ Data persists across tab switches

---

### Test 6: Validation

**Goal:** Verify form validation works

**Steps:**

1. Create new lesson
2. Leave ID empty → Click Save
3. Should see: "⚠️ Vui lòng điền đầy đủ thông tin!"
4. Fill ID but leave Title empty → Save
5. Should see same error
6. Fill both → Save should work

**Expected Result:** ✅ Validation prevents empty fields

---

### Test 7: Cancel & Close

**Goal:** Verify modal closes without saving

**Steps:**

1. Create new lesson
2. Fill some data (ID, title)
3. Click **❌ Hủy** button
4. Modal should close
5. Data should NOT be saved
6. Open create lesson again
7. Form should be empty (reset)

**Expected Result:** ✅ Cancel works, no data saved

---

### Test 8: Mobile Responsive

**Goal:** Verify mobile view works

**Steps:**

1. Open DevTools
2. Toggle Device Toolbar (`Ctrl+Shift+M`)
3. Select: iPhone 12 Pro (or any mobile device)
4. Create new lesson
5. Verify:
   - Modal fits screen
   - Tabs stack vertically or scroll
   - Buttons are touch-friendly (44px min)
   - Text readable (no tiny fonts)
   - No horizontal overflow

**Expected Result:** ✅ Mobile-friendly UI

---

### Test 9: Backward Compatibility

**Goal:** Verify old code still works

**Steps:**

1. **Frontend View (Student):**
   - Navigate to book → chapter → lesson (old lesson)
   - Lesson should display normally
   - Theory content shows (PDF or HTML)
   - Quiz works if available
   - No SRS shown (srs.enabled = false)

2. **Code Check:**
```javascript
// Old code reading lesson
const lesson = await storageManager.getLesson(bookId, chapterId, lessonId);

// Should work:
console.log(lesson.pdfUrl); // ✅ Still accessible
console.log(lesson.content); // ✅ Still accessible

// New code:
console.log(lesson.theory.pdfUrl); // ✅ Also works
console.log(lesson.srs.enabled); // ✅ New field
```

**Expected Result:** ✅ Old code still reads data

---

### Test 10: Multiple Saves (Edit Cycle)

**Goal:** Verify edit → save → edit → save cycle works

**Steps:**

1. Create new lesson → Save (v1)
2. Edit same lesson → Change title → Save (v2)
3. Edit again → Enable SRS → Save (v3)
4. Edit again → Change cards/day → Save (v4)
5. Reload page
6. Find lesson → Verify latest changes (v4)

**Expected Result:** ✅ Multiple edits work, data persists

---

## 🐛 Common Issues & Solutions

### Issue 1: Modal không mở

**Symptom:** Click "Add Lesson" → Nothing happens

**Debug:**
1. Check console for errors
2. Verify imports in `ContentManagementPage.jsx`:
```javascript
import EnhancedLessonModal from '../../components/admin/lessons/EnhancedLessonModal.jsx';
```
3. Verify modal prop:
```javascript
isOpen={showLessonForm && !!selectedBook && !!selectedChapter}
```

**Fix:** Ensure book & chapter selected before adding lesson

---

### Issue 2: Save không work

**Symptom:** Click Save → No alert, no data saved

**Debug:**
1. Check console for errors
2. Check `handleSaveLesson` function
3. Verify lessonData structure:
```javascript
console.log('lessonData:', lessonData);
```

**Fix:** Ensure `onSave` prop passed correctly

---

### Issue 3: Migration không chạy

**Symptom:** Edit old lesson → No console log "📦 Auto-migrated..."

**Debug:**
1. Check old lesson structure in IndexedDB
2. Verify `migrateLegacyLesson` imported
3. Check `handleEditLesson` function

**Fix:** Ensure import exists and function calls migration

---

### Issue 4: Tabs không switch

**Symptom:** Click tab → Nothing happens

**Debug:**
1. Check `activeTab` state
2. Verify `onTabChange` callback
3. Check console for errors

**Fix:** Ensure tab IDs match in config and TabPanel

---

### Issue 5: IndexedDB không save

**Symptom:** Data không xuất hiện trong IndexedDB

**Debug:**
1. Check `storageManager.saveLessons()` call
2. Verify database name: `elearning_db`
3. Check store name: `lessons`
4. Look for errors in console

**Fix:** Ensure storageManager initialized correctly

---

## ✅ Test Checklist

Đánh dấu khi hoàn thành:

### Component Tests
- [ ] ContentTypeSelector renders all 6 types
- [ ] Tabs switch correctly
- [ ] TheoryTab: PDF input works
- [ ] TheoryTab: HTML input works
- [ ] TheoryTab: Audio input works
- [ ] FlashcardTab: SRS toggle works
- [ ] FlashcardTab: Settings editable
- [ ] Modal opens/closes
- [ ] Form validation works
- [ ] Save button works

### Integration Tests
- [ ] Create new Grammar lesson
- [ ] Create new Vocabulary lesson (with SRS)
- [ ] Create new Kanji lesson
- [ ] Edit old lesson (auto-migration)
- [ ] Edit new lesson
- [ ] Delete lesson
- [ ] Multiple save cycles

### Data Tests
- [ ] New format saves to IndexedDB
- [ ] Old format migrates correctly
- [ ] Data persists across tabs
- [ ] Data persists after reload
- [ ] No data corruption

### UI Tests
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] All buttons clickable
- [ ] All inputs editable
- [ ] Scrollable areas work

### Browser Tests
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if Mac available)

### Performance Tests
- [ ] Modal opens < 100ms
- [ ] Save completes < 1s
- [ ] No console errors
- [ ] No memory leaks

---

## 📊 Test Results Template

Copy this to report results:

```markdown
## Test Results - Phase 1 Integration

**Tester:** [Your Name]
**Date:** [YYYY-MM-DD]
**Browser:** Chrome 120 / Edge 120 / Firefox 121
**OS:** Windows 11 / macOS / Linux

### Test Summary
- ✅ Tests Passed: X/10
- ❌ Tests Failed: X/10
- ⚠️ Issues Found: X

### Detailed Results

1. Create New Lesson with SRS: ✅ PASS
   - Notes: Saved correctly, SRS enabled

2. Edit Old Lesson: ✅ PASS
   - Notes: Auto-migration worked, console log appeared

3. Create Grammar Lesson: ✅ PASS
   - Notes: SRS disabled by default

4. Switch ContentType: ✅ PASS
   - Notes: Tabs updated correctly

5. Tab Navigation: ✅ PASS
   - Notes: Data persisted across tabs

6. Validation: ✅ PASS
   - Notes: Error messages appeared

7. Cancel & Close: ✅ PASS
   - Notes: Modal closed without saving

8. Mobile Responsive: ✅ PASS
   - Notes: UI looks good on mobile

9. Backward Compatibility: ✅ PASS
   - Notes: Old lessons display correctly

10. Multiple Saves: ✅ PASS
    - Notes: Edit cycle works

### Issues Found

1. [Issue Title]
   - Severity: High / Medium / Low
   - Description: [What happened]
   - Steps to Reproduce: [1, 2, 3...]
   - Expected: [What should happen]
   - Actual: [What actually happened]
   - Screenshots: [If any]

### Recommendations

- [Suggestion 1]
- [Suggestion 2]

### Conclusion

Phase 1 integration is: ✅ READY / ⚠️ NEEDS FIX / ❌ NOT READY
```

---

## 🎯 Success Criteria

Phase 1 passes if:

✅ **All 10 test cases pass**
✅ **Zero console errors**
✅ **Zero linter errors**
✅ **Data saves correctly in IndexedDB**
✅ **Old lessons auto-migrate**
✅ **Mobile responsive works**
✅ **No breaking changes**

---

## 📞 Support

Nếu gặp vấn đề:

1. Check console logs
2. Check IndexedDB data
3. Review `SRS_PHASE1_COMPLETE.md`
4. Check `SRS_INTEGRATION_DEMO.jsx`
5. Ask team for help

---

**Happy Testing!** 🧪🚀

---

**Version:** 1.0.0  
**Last Updated:** 20 Nov 2025  
**Status:** Ready for Testing

