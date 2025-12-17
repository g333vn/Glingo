import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
// ✅ Import antd patch for React 19 compatibility
import '@ant-design/v5-patch-for-react-19';
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';

// ✅ CRITICAL: Import all providers to wrap RouterProvider
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ToastProvider } from './components/ToastNotification.jsx';
import { DictionaryProvider } from './components/api_translate/index.js';

import App from './App.jsx';
import './styles/index.css';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// ✅ CODE SPLITTING: Lazy load pages
// Critical pages (load immediately)
import HomePage from './pages/HomePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AccessGuard from './components/AccessGuard.jsx';

// Lazy load non-critical pages
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

// Lazy load Level pages
const LevelPage = lazy(() => import('./features/books/pages/LevelPage.jsx'));
const LevelN1Page = lazy(() => import('./features/books/pages/LevelN1Page.jsx'));
const LevelN2Page = lazy(() => import('./features/books/pages/LevelN2Page.jsx'));
const LevelN3Page = lazy(() => import('./features/books/pages/LevelN3Page.jsx'));
const LevelN4Page = lazy(() => import('./features/books/pages/LevelN4Page.jsx'));
const LevelN5Page = lazy(() => import('./features/books/pages/LevelN5Page.jsx'));
const BookDetailPage = lazy(() => import('./features/books/pages/BookDetailPage.jsx'));
const LessonPage = lazy(() => import('./features/books/pages/LessonPage.jsx'));
const QuizPage = lazy(() => import('./features/books/pages/QuizPage.jsx'));

// Lazy load JLPT pages
const JLPTPage = lazy(() => import('./features/jlpt/pages/JLPTPage.jsx'));
const JLPTLevelN1Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN1Page.jsx'));
const JLPTLevelN2Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN2Page.jsx'));
const JLPTLevelN3Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN3Page.jsx'));
const JLPTLevelN4Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN4Page.jsx'));
const JLPTLevelN5Page = lazy(() => import('./features/jlpt/pages/JLPTLevelN5Page.jsx'));
const JLPTExamDetailPage = lazy(() => import('./features/jlpt/pages/JLPTExamDetailPage.jsx'));
const ExamKnowledgePage = lazy(() => import('./features/jlpt/pages/ExamKnowledgePage.jsx'));
const ExamListeningPage = lazy(() => import('./features/jlpt/pages/ExamListeningPage.jsx'));
const JLPTExamResultPage = lazy(() => import('./features/jlpt/pages/JLPTExamResultPage.jsx'));
const ExamAnswersPage = lazy(() => import('./features/jlpt/pages/ExamAnswersPage.jsx'));

// Lazy load Dashboard pages
const DashboardAccessGuard = lazy(() => import('./components/DashboardAccessGuard.jsx'));
const FlashcardReviewPage = lazy(() => import('./pages/FlashcardReviewPage.jsx'));
const StatisticsDashboard = lazy(() => import('./pages/StatisticsDashboard.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));

// Lazy load Admin pages (heavy)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const QuizEditorPage = lazy(() => import('./pages/admin/QuizEditorPage.jsx'));
const UsersManagementPage = lazy(() => import('./pages/admin/UsersManagementPage.jsx'));
const ContentManagementPage = lazy(() => import('./pages/admin/ContentManagementPage.jsx'));
const ExamManagementPage = lazy(() => import('./pages/admin/ExamManagementPage.jsx'));
const ExportImportPage = lazy(() => import('./pages/admin/ExportImportPage.jsx'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage.jsx'));
const NewControlPage = lazy(() => import('./pages/admin/NewControlPage.jsx'));
const NotificationManagementPage = lazy(() => import('./pages/admin/NotificationManagementPage.jsx'));

// Lazy load Editor pages
const EditorLayout = lazy(() => import('./components/editor/EditorLayout.jsx'));
const EditorDashboardPage = lazy(() => import('./pages/editor/EditorDashboardPage.jsx'));

// ✅ Loading Spinner Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Đang tải...</p>
    </div>
  </div>
);

// ✅ Suspense wrapper for lazy components
const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Set --app-vh to fix 100vh issues on mobile browsers
function setAppVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--app-vh', `${vh}px`);
}
setAppVh();
window.addEventListener('resize', setAppVh);
window.addEventListener('orientationchange', setAppVh);

// Component placeholder cho level chưa implement
const LevelPlaceholder = ({ levelId = 'Unknown', type = 'LEVEL' }) => (
  <div className="p-8 text-center bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg mx-4">
    <h1 className="text-2xl font-bold mb-4">{type} {levelId.toUpperCase()} - Sắp ra mắt</h1>
    <p className="text-gray-600 mb-4">Nội dung cho {levelId} sẽ được cập nhật sớm. Vui lòng quay lại sau!</p>
    <a href={type === 'JLPT' ? '/jlpt' : '/level'} className="text-blue-500 hover:underline mt-4 inline-block">
      ← Quay về {type}
    </a>
  </div>
);

// Component 404 chung
const NotFoundPage = () => (
  <div className="p-8 text-center bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg mx-4">
    <h1 className="text-3xl font-bold text-red-500 mb-4">404 - Không tìm thấy trang</h1>
    <p className="text-gray-600 mb-4">Có vẻ như đường dẫn bạn tìm không tồn tại.</p>
    <a href="/" className="text-blue-500 hover:underline">Quay về Trang chủ</a>
  </div>
);

// Wrapper component cho route động LEVEL
function DynamicLevelPage() {
  const { levelId } = useParams();
  if (!levelId) {
    return <NotFoundPage />;
  }
  const normalizedLevelId = levelId.toLowerCase();
  
  let PageComponent;
  switch (normalizedLevelId) {
    case 'n1': PageComponent = LevelN1Page; break;
    case 'n2': PageComponent = LevelN2Page; break;
    case 'n3': PageComponent = LevelN3Page; break;
    case 'n4': PageComponent = LevelN4Page; break;
    case 'n5': PageComponent = LevelN5Page; break;
    default: return <LevelPlaceholder levelId={levelId} type="LEVEL" />;
  }
  
  return (
    <AccessGuard module="level" levelId={normalizedLevelId}>
      <LazyPage>
        <PageComponent />
      </LazyPage>
    </AccessGuard>
  );
}

// Wrapper component cho route động JLPT
function DynamicJLPTLevelPage() {
  const { levelId } = useParams();
  if (!levelId) {
    return <NotFoundPage />;
  }
  const normalizedLevelId = levelId.toLowerCase();
  
  let PageComponent;
  switch (normalizedLevelId) {
    case 'n1': PageComponent = JLPTLevelN1Page; break;
    case 'n2': PageComponent = JLPTLevelN2Page; break;
    case 'n3': PageComponent = JLPTLevelN3Page; break;
    case 'n4': PageComponent = JLPTLevelN4Page; break;
    case 'n5': PageComponent = JLPTLevelN5Page; break;
    default: return <LevelPlaceholder levelId={levelId} type="JLPT" />;
  }
  
  return (
    <AccessGuard module="jlpt" levelId={normalizedLevelId}>
      <LazyPage>
        <PageComponent />
      </LazyPage>
    </AccessGuard>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      // ========== LEVEL ROUTES ==========
      {
        path: 'level',
        element: <LazyPage><LevelPage /></LazyPage>
      },
      {
        path: 'level/:levelId',
        element: <DynamicLevelPage />
      },
      {
        path: 'level/:levelId/:bookId',
        element: <LazyPage><BookDetailPage /></LazyPage>
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId',
        element: <LazyPage><BookDetailPage /></LazyPage>
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId',
        element: <LazyPage><LessonPage /></LazyPage>
      },
      // Route cho quiz standalone (khi click "Bắt đầu làm quiz" trong LessonPage)
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId/quiz',
        element: <LazyPage><QuizPage /></LazyPage>
      },
      // Backward compatibility: old route without chapterId
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId',
        element: <LazyPage><LessonPage /></LazyPage>
      },
      // Backward compatibility: old quiz route
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId/quiz',
        element: <LazyPage><QuizPage /></LazyPage>
      },
      // ========== PHASE 3: SRS ROUTES ==========
      {
        path: 'dashboard',
        element: (
          <LazyPage>
            <DashboardAccessGuard>
              <UserDashboard />
            </DashboardAccessGuard>
          </LazyPage>
        )
      },
      {
        path: 'review/:deckId',
        element: <LazyPage><FlashcardReviewPage /></LazyPage>
      },
      {
        path: 'statistics/:deckId',
        element: <LazyPage><StatisticsDashboard /></LazyPage>
      },
      // ========== JLPT ROUTES ==========
      // ✅ Route cụ thể hơn phải được đặt TRƯỚC route tổng quát hơn
      {
        path: 'jlpt',
        element: <LazyPage><JLPTPage /></LazyPage>
      },
      // Route cho bài thi kiến thức (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/knowledge',
        element: <LazyPage><ExamKnowledgePage /></LazyPage>
      },
      // Route cho bài thi nghe (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/listening',
        element: <LazyPage><ExamListeningPage /></LazyPage>
      },
      // Route cho kết quả bài thi (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/result',
        element: <LazyPage><JLPTExamResultPage /></LazyPage>
      },
      // ✅ NEW: Route cho trang xem đáp án và giải thích (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/answers',
        element: <LazyPage><ExamAnswersPage /></LazyPage>
      },
      // Route cho exam detail (cụ thể hơn levelId)
      {
        path: 'jlpt/:levelId/:examId',
        element: <LazyPage><JLPTExamDetailPage /></LazyPage>
      },
      // Route cho level (tổng quát hơn)
      {
        path: 'jlpt/:levelId',
        element: <DynamicJLPTLevelPage />
      },
      // ========== OTHER ROUTES ==========
      {
        path: 'about',
        element: <LazyPage><AboutPage /></LazyPage>
      },
      {
        path: 'terms',
        element: <LazyPage><TermsPage /></LazyPage>
      },
      {
        path: 'privacy',
        element: <LazyPage><PrivacyPage /></LazyPage>
      },
      // ✅ NEW: Login Page
      {
        path: 'login',
        element: <LazyPage><LoginPage /></LazyPage>
      },
      // ✅ NEW: Register Page
      {
        path: 'register',
        element: <LazyPage><RegisterPage /></LazyPage>
      },
      // ✅ NEW: Profile Page (Protected - Requires login)
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <LazyPage><ProfilePage /></LazyPage>
          </ProtectedRoute>
        )
      },
      // ✅ NEW: Admin Routes (Protected - Admin only)
      {
        path: 'admin',
        element: (
          <ProtectedRoute adminOnly={true}>
            <LazyPage><AdminLayout /></LazyPage>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <LazyPage><AdminDashboardPage /></LazyPage>
          },
          {
            path: 'quiz-editor',
            element: <LazyPage><QuizEditorPage /></LazyPage>
          },
          {
            path: 'users',
            element: <LazyPage><UsersManagementPage /></LazyPage>
          },
          {
            path: 'content',
            element: <LazyPage><ContentManagementPage /></LazyPage>
          },
          {
            path: 'exams',
            element: <LazyPage><ExamManagementPage /></LazyPage>
          },
          {
            path: 'export-import',
            element: <LazyPage><ExportImportPage /></LazyPage>
          },
          {
            path: 'settings',
            element: <LazyPage><SettingsPage /></LazyPage>
          },
          {
            path: 'new-control',
            element: <LazyPage><NewControlPage /></LazyPage>
          },
          {
            path: 'notifications',
            element: <LazyPage><NotificationManagementPage /></LazyPage>
          }
        ]
      },
      // ✅ NEW: Editor Routes (Protected - Editor only)
      {
        path: 'editor',
        element: (
          <ProtectedRoute editorOnly={true}>
            <LazyPage><EditorLayout /></LazyPage>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <LazyPage><EditorDashboardPage /></LazyPage>
          },
          {
            path: 'quiz-editor',
            element: <LazyPage><QuizEditorPage /></LazyPage>
          },
          {
            path: 'exams',
            element: <LazyPage><ExamManagementPage /></LazyPage>
          }
        ]
      },
      // ========== DEV/EXAMPLE ROUTES ==========
      ...(import.meta.env.DEV
        ? [
            {
              path: 'examples/translation',
              element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/TranslationExample.jsx')))}</LazyPage>
            },
            {
              path: 'test-i18n',
              element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/LanguageTestComponent.jsx')))}</LazyPage>
            },
            {
              path: 'test-i18n-simple',
              element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/SimpleTranslationTest.jsx')))}</LazyPage>
            },
            {
              path: 'debug-i18n',
              element: <LazyPage>{React.createElement(lazy(() => import('./components/examples/DebugTranslationTest.jsx')))}</LazyPage>
            }
          ]
        : []),
      // ========== 404 ==========
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

// ✅ CRITICAL FIX: Wrap RouterProvider with all providers
// This ensures Router has access to AuthProvider and other contexts
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <DictionaryProvider>
              <RouterProvider router={router} />
            </DictionaryProvider>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
