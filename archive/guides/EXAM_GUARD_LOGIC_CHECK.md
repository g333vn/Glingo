# Exam Guard Logic Verification

## ✅ Kiểm tra từng case theo flow:

### Case 1: Detail (lần đầu) → Click "言語知識" → KHÔNG cảnh báo
- **Status**: `safe-to-leave` (shouldWarn: false)
- **Action**: Click Knowledge → `shouldShowWarning('/jlpt/n1/2024-12/knowledge')`
- **Exception 0**: `status.reason === 'safe-to-leave' && targetPath` → `isNavigatingToSameExamKnowledge` → return **false** ✅
- **Result**: KHÔNG cảnh báo ✅

### Case 2: Knowledge Page (đang làm) → Rời đi → CÓ cảnh báo
- **Status**: `knowledge-in-progress` (shouldWarn: true)
- **Action**: Rời đi → `shouldShowWarning(targetPath)` với targetPath ≠ Knowledge
- **Exception**: Không match → return `status.shouldWarn` = **true** ✅
- **Result**: CÓ cảnh báo ✅

### Case 3: Knowledge submit → Detail (Knowledge xong)
- **Knowledge completed**: true
- **Status**: `detail-knowledge-done-listening-pending` (shouldWarn: true) ✅

### Case 4: Detail (Knowledge xong) → Click "聴解" → KHÔNG cảnh báo
- **Status**: `detail-knowledge-done-listening-pending` (shouldWarn: true)
- **Action**: Click Listening → `shouldShowWarning('/jlpt/n1/2024-12/listening')`
- **Exception 1**: `status.reason === 'detail-knowledge-done-listening-pending' && targetPath` → `isNavigatingToSameExamListening` → return **false** ✅
- **Result**: KHÔNG cảnh báo ✅

### Case 5: Detail (Knowledge xong) → Rời đi khác → CÓ cảnh báo
- **Status**: `detail-knowledge-done-listening-pending` (shouldWarn: true)
- **Action**: Rời đi khác → `shouldShowWarning(targetPath)` với targetPath ≠ Listening
- **Exception**: Không match → return `status.shouldWarn` = **true** ✅
- **Result**: CÓ cảnh báo ✅

### Case 6: Listening Page (đang làm) → Rời đi → CÓ cảnh báo
- **Status**: `listening-in-progress` (shouldWarn: true)
- **Action**: Rời đi → `shouldShowWarning(targetPath)` với targetPath ≠ Listening
- **Exception**: Không match → return `status.shouldWarn` = **true** ✅
- **Result**: CÓ cảnh báo ✅

### Case 7: Listening submit → Detail (cả 2 xong)
- **Listening completed**: true
- **Status**: `detail-both-completed` (shouldWarn: true) ✅

### Case 8: Detail (cả 2 xong) → Click "結果を見る" → KHÔNG cảnh báo
- **Status**: `detail-both-completed` (shouldWarn: true)
- **Action**: Click Result → `shouldShowWarning('/jlpt/n1/2024-12/result')`
- **Exception 2**: `status.reason === 'detail-both-completed' && targetPath` → `isNavigatingToSameExamResult` → return **false** ✅
- **Result**: KHÔNG cảnh báo ✅

### Case 9: Result Page → Click "解答・解説を見る" → KHÔNG cảnh báo
- **Status**: `result-page` (shouldWarn: true)
- **Action**: Click Answers → `shouldShowWarning('/jlpt/n1/2024-12/answers')`
- **Exception 3**: `status.reason === 'result-page' && targetPath` → `isNavigatingToSameExamAnswers` → return **false** ✅
- **Result**: KHÔNG cảnh báo ✅

### Case 10: Answers Page → Click "結果画面に戻る" → KHÔNG cảnh báo
- **Status**: `answers-page` (shouldWarn: true)
- **Action**: Click Result → `shouldShowWarning('/jlpt/n1/2024-12/result')`
- **Exception 4**: `status.reason === 'answers-page' && targetPath` → `isNavigatingToSameExamResult` → return **false** ✅
- **Result**: KHÔNG cảnh báo ✅

### Case 11: Answers Page → Rời đi khác → CÓ cảnh báo (xóa data)
- **Status**: `answers-page` (shouldWarn: true)
- **Action**: Rời đi khác → `shouldShowWarning(targetPath)` với targetPath ≠ Result
- **Exception**: Không match → return `status.shouldWarn` = **true** ✅
- **Result**: CÓ cảnh báo (xóa data khi confirm) ✅

## ✅ Tất cả logic đã được kiểm tra và đúng!

## 📝 Các function helper đã normalize path:
- ✅ `isNavigatingToSameExamKnowledge` - normalize path
- ✅ `isNavigatingToSameExamListening` - normalize path
- ✅ `isNavigatingToSameExamResult` - normalize path (đã sửa)
- ✅ `isNavigatingToSameExamAnswers` - normalize path (đã sửa)

## 🎯 Tất cả exceptions đã được implement:
- ✅ Exception 0: Detail (lần đầu) → Knowledge
- ✅ Exception 1: Detail (Knowledge xong) → Listening
- ✅ Exception 2: Detail (cả 2 xong) → Result
- ✅ Exception 3: Result → Answers
- ✅ Exception 4: Answers → Result

