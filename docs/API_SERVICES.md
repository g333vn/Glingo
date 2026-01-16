# API & Services Reference

## Services Overview

```
src/services/
├── supabaseClient.js       # Supabase client configuration
├── authService.js          # Authentication operations
├── contentService.js       # Content CRUD (books, lessons)
├── examService.js          # JLPT exam operations
├── accessControlService.js # Access control management
├── appSettingsService.js   # App settings management
├── srsAlgorithm.js         # Spaced repetition logic
├── userManagementService.js # User management
├── learningProgressService.js # Progress tracking
├── examResultsService.js   # Exam results storage
└── fileUploadService.js    # File upload handling
```

## Authentication Service

### `authService.js`

#### Sign Up

```javascript
import { signUp } from './services/authService';

const result = await signUp({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe'
});

// Returns: { success: boolean, data?: object, error?: string }
```

#### Sign In

```javascript
import { signIn } from './services/authService';

const result = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Returns: { success: boolean, data?: object, error?: string }
```

#### Sign Out

```javascript
import { signOut } from './services/authService';

const result = await signOut();

// Returns: { success: boolean, error?: string }
```

#### Get Current User

```javascript
import { getCurrentUser } from './services/authService';

const result = await getCurrentUser();

// Returns: { success: boolean, user?: object, error?: string }
```

#### Get User Profile

```javascript
import { getUserProfile } from './services/authService';

const result = await getUserProfile(userId);

// Returns: { success: boolean, profile?: object, error?: string }
```

#### Update Profile

```javascript
import { updateUserProfile } from './services/authService';

const result = await updateUserProfile(userId, {
  display_name: 'New Name',
  avatar_url: 'https://...'
});

// Returns: { success: boolean, profile?: object, error?: string }
```

#### Update Password

```javascript
import { updatePassword } from './services/authService';

const result = await updatePassword('newPassword123');

// Returns: { success: boolean, error?: string }
```

## Content Service

### `contentService.js`

#### Books

```javascript
import { getBooks, saveBook, deleteBook } from './services/contentService';

// Get all books for a level
const { success, data } = await getBooks('n5');

// Save book
const result = await saveBook({
  id: 'book-1',
  level: 'n5',
  title: 'Minna no Nihongo',
  description: '...'
}, userId);

// Delete book
const result = await deleteBook('book-1', 'n5');
```

#### Chapters

```javascript
import { getChapters, saveChapters } from './services/contentService';

// Get chapters for a book
const { success, data } = await getChapters(bookId, level);

// Save chapters
const result = await saveChapters(bookId, level, chapters, userId);
```

#### Lessons

```javascript
import { getLessons, saveLessons } from './services/contentService';

// Get lessons for a chapter
const { success, data } = await getLessons(bookId, chapterId, level);

// Save lessons
const result = await saveLessons(bookId, chapterId, level, lessons, userId);
```

#### Quizzes

```javascript
import { getQuiz, saveQuiz, deleteQuiz } from './services/contentService';

// Get quiz
const { success, data } = await getQuiz(bookId, chapterId, lessonId, level);

// Save quiz
const result = await saveQuiz({
  id: 'quiz-1',
  bookId,
  chapterId,
  lessonId,
  level: 'n5',
  title: 'Vocabulary Quiz',
  questions: [...]
}, userId);
```

## Exam Service

### `examService.js`

#### Get Exams

```javascript
import { getExamsByLevel, getExam } from './services/examService';

// Get all exams for a level
const { success, data } = await getExamsByLevel('n5');

// Get specific exam
const { success, data } = await getExam('n5', 'exam-2024-07');
```

#### Save Exam

```javascript
import { saveExam } from './services/examService';

const result = await saveExam({
  id: 'exam-2024-07',
  level: 'n5',
  year: 2024,
  month: 7,
  title: 'JLPT N5 - July 2024',
  knowledgeQuestions: [...],
  listeningQuestions: [...]
}, userId);
```

## Access Control Service

### `accessControlService.js`

#### Get Access Control

```javascript
import { getAccessControlFromSupabase } from './services/accessControlService';

const { success, data } = await getAccessControlFromSupabase();

// Returns:
// {
//   levelConfigs: { n5: {...}, n4: {...} },
//   jlptConfigs: { n5: {...}, n4: {...} },
//   levelModuleConfig: { enabled: true },
//   jlptModuleConfig: { enabled: true }
// }
```

#### Update Access Control

```javascript
import { saveAccessControlToSupabase } from './services/accessControlService';

const result = await saveAccessControlToSupabase({
  levelConfigs: {
    n5: { public: true, requireLogin: false },
    n4: { public: false, requireLogin: true }
  }
});
```

#### Real-time Subscription

```javascript
import { subscribeToAccessControl } from './services/accessControlService';

const unsubscribe = subscribeToAccessControl((data) => {
  console.log('Access control updated:', data);
});

// Later: unsubscribe();
```

## SRS Algorithm

### `srsAlgorithm.js`

#### Calculate Next Review

```javascript
import { calculateNextReview, GRADES } from './services/srsAlgorithm';

const updatedProgress = calculateNextReview(cardProgress, GRADES.GOOD);

// Returns updated progress with:
// - easeFactor
// - interval
// - repetitions
// - state
// - nextReview
```

#### Initialize Card

```javascript
import { initializeCardProgress } from './services/srsAlgorithm';

const progress = initializeCardProgress(cardId, deckId, userId);
```

#### Get Due Cards

```javascript
import { getDueCards, isCardDue } from './services/srsAlgorithm';

// Get all due cards
const dueCards = getDueCards(allProgress);

// Check single card
const isDue = isCardDue(cardProgress);
```

#### Calculate Stats

```javascript
import { calculateDeckStats } from './services/srsAlgorithm';

const stats = calculateDeckStats(allProgress);

// Returns:
// {
//   total: 100,
//   new: 20,
//   learning: 10,
//   review: 50,
//   graduated: 20,
//   due: 15,
//   retention: 0.85,
//   averageEase: 2.5
// }
```

## Storage Manager

### `localStorageManager.js`

Unified storage interface with automatic fallback.

#### Get/Save Data

```javascript
import storageManager from './utils/localStorageManager';

// Books
const books = await storageManager.getBooks('n5');
await storageManager.saveBooks('n5', books, userId);

// Chapters
const chapters = await storageManager.getChapters(bookId, level);
await storageManager.saveChapters(bookId, chapters, level, userId);

// Lessons
const lessons = await storageManager.getLessons(bookId, chapterId, level);
await storageManager.saveLessons(bookId, chapterId, lessons, level, userId);

// Quizzes
const quiz = await storageManager.getQuiz(bookId, chapterId, lessonId, level);
await storageManager.saveQuiz(bookId, chapterId, lessonId, quiz, level, userId);

// Exams
const exams = await storageManager.getExams(level);
await storageManager.saveExams(level, exams);
```

#### Export/Import

```javascript
// Export all data
const exportData = await storageManager.exportAll();

// Export specific level
const levelData = await storageManager.exportLevel('n5');

// Import data
const result = await storageManager.importAll(data);
```

#### Storage Info

```javascript
const info = await storageManager.getStorageInfo();

// Returns:
// {
//   totalSize: '2.5 MB',
//   totalSizeBytes: 2621440,
//   itemCount: 150,
//   indexedDB: true,
//   localStorage: {...}
// }
```

## Contexts

### Auth Context

```javascript
import { useAuth } from './contexts/AuthContext';

function Component() {
  const {
    user,           // Current user object
    profile,        // User profile
    isLoading,      // Loading state
    isAuthenticated,// Auth status
    login,          // Sign in function
    logout,         // Sign out function
    register,       // Sign up function
    updateProfile,  // Update profile function
    isAdmin,        // Check admin role
    isEditor,       // Check editor role
    hasPermission   // Check specific permission
  } = useAuth();
}
```

### Language Context

```javascript
import { useLanguage } from './contexts/LanguageContext';

function Component() {
  const {
    language,       // Current language code
    setLanguage,    // Change language
    t               // Translation function
  } = useLanguage();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

## Hooks

### `useAccessControl`

```javascript
import { useAccessControl } from './hooks/useAccessControl';

function Component() {
  const {
    canAccessLevel,    // Check level access
    canAccessModule,   // Check module access
    isLoading
  } = useAccessControl();
  
  if (!canAccessLevel('n4')) {
    return <AccessDenied />;
  }
}
```

### `useExamGuard`

```javascript
import { useExamGuard } from './hooks/useExamGuard';

function ExamPage() {
  const {
    isAllowed,         // Can take exam
    remainingAttempts, // Attempts left
    checkAccess
  } = useExamGuard(examId);
}
```

## Error Handling

All services use a consistent return format:

```javascript
// Success
{
  success: true,
  data: {...}
}

// Error
{
  success: false,
  error: 'Error message',
  data: null
}
```

### Example Error Handling

```javascript
const { success, data, error } = await someService();

if (!success) {
  console.error('Operation failed:', error);
  // Show error to user
  return;
}

// Use data
console.log('Success:', data);
```

## Supabase Client

### Configuration

```javascript
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

// Check if configured
if (!isSupabaseConfigured()) {
  console.warn('Supabase not configured');
}

// Direct Supabase access
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value');
```

### Real-time Subscriptions

```javascript
const subscription = supabase
  .channel('changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'app_settings' },
    (payload) => {
      console.log('Change received:', payload);
    }
  )
  .subscribe();

// Later: subscription.unsubscribe();
```
