import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
// ✅ Import antd patch for React 19 compatibility
import '@ant-design/v5-patch-for-react-19';
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';

// ✅ CRITICAL: Import all providers to wrap RouterProvider
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ToastProvider } from './components/ToastNotification.jsx';
import { DictionaryProvider } from './components/api_translate/index.js';

// ✅ Core components (keep non-lazy for initial load)
import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AccessGuard from './components/AccessGuard.jsx';
import DashboardAccessGuard from './components/DashboardAccessGuard.jsx';
import RouteSuspense from './components/RouteSuspense.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// ✅ PHASE 1: Code Splitting - Lazy load all page components
// Public pages
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

// Level module pages
const LevelPage = lazy(() => import('./features/books/pages/LevelPage.jsx'));
const LevelN1Page = lazy(() => import('./features/books/pages/LevelN1Page.jsx'));
const LevelN2Page = lazy(() => import('./features/books/pages/LevelN2Page.jsx'));
const LevelN3Page = lazy(() => import('./features/books/pages/LevelN3Page.jsx'));
const LevelN4Page = lazy(() => import('./features/books/pages/LevelN4Page.jsx'));
const LevelN5Page = lazy(() => import('./features/books/pages/LevelN5Page.jsx'));
const BookDetailPage = lazy(() => import('./features/books/pages/BookDetailPage.jsx'));
const LessonPage = lazy(() => import('./features/books/pages/LessonPage.jsx'));
const QuizPage = lazy(() => import('./features/books/pages/QuizPage.jsx'));

// JLPT module pages
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

// SRS module pages
const FlashcardReviewPage = lazy(() => import('./pages/FlashcardReviewPage.jsx'));
const StatisticsDashboard = lazy(() => import('./pages/StatisticsDashboard.jsx'));
const UserDashboard = lazy(() => import('./pages/UserDashboard.jsx'));

// Admin pages (lazy load - only admin users access)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'));
const QuizEditorPage = lazy(() => import('./pages/admin/QuizEditorPage.jsx'));
const UsersManagementPage = lazy(() => import('./pages/admin/UsersManagementPage.jsx'));
const ContentManagementPage = lazy(() => import('./pages/admin/ContentManagementPage.jsx'));
const ExamManagementPage = lazy(() => import('./pages/admin/ExamManagementPage.jsx'));
const ExportImportPage = lazy(() => import('./pages/admin/ExportImportPage.jsx'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage.jsx'));
const NewControlPage = lazy(() => import('./pages/admin/NewControlPage.jsx'));
const DashboardAccessPage = lazy(() => import('./pages/admin/DashboardAccessPage.jsx'));
const NotificationManagementPage = lazy(() => import('./pages/admin/NotificationManagementPage.jsx'));

// Editor pages (lazy load - only editor users access)
const EditorLayout = lazy(() => import('./components/editor/EditorLayout.jsx'));
const EditorDashboardPage = lazy(() => import('./pages/editor/EditorDashboardPage.jsx'));

// Dev/Example components (only in development)
const TranslationExample = lazy(() => import('./components/examples/TranslationExample.jsx'));
const LanguageTestComponent = lazy(() => import('./components/examples/LanguageTestComponent.jsx'));
const SimpleTranslationTest = lazy(() => import('./components/examples/SimpleTranslationTest.jsx'));
const DebugTranslationTest = lazy(() => import('./components/examples/DebugTranslationTest.jsx'));

import './styles/index.css';

// ✅ PHASE 5: Optimization utilities will be loaded dynamically
// This avoids build failures if files are not yet committed

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
      <RouteSuspense>
        <PageComponent />
      </RouteSuspense>
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
      <RouteSuspense>
        <PageComponent />
      </RouteSuspense>
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
        element: (
          <RouteSuspense>
            <HomePage />
          </RouteSuspense>
        )
      },
      // ========== LEVEL ROUTES ==========
      {
        path: 'level',
        element: (
          <RouteSuspense>
            <LevelPage />
          </RouteSuspense>
        )
      },
      {
        path: 'level/:levelId',
        element: (
          <RouteSuspense>
            <DynamicLevelPage />
          </RouteSuspense>
        )
      },
      {
        path: 'level/:levelId/:bookId',
        element: (
          <RouteSuspense>
            <BookDetailPage />
          </RouteSuspense>
        )
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId',
        element: (
          <RouteSuspense>
            <BookDetailPage />
          </RouteSuspense>
        )
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId',
        element: (
          <RouteSuspense>
            <LessonPage />
          </RouteSuspense>
        )
      },
      // Route cho quiz standalone (khi click "Bắt đầu làm quiz" trong LessonPage)
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId/quiz',
        element: (
          <RouteSuspense>
            <QuizPage />
          </RouteSuspense>
        )
      },
      // Backward compatibility: old route without chapterId
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId',
        element: (
          <RouteSuspense>
            <LessonPage />
          </RouteSuspense>
        )
      },
      // Backward compatibility: old quiz route
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId/quiz',
        element: (
          <RouteSuspense>
            <QuizPage />
          </RouteSuspense>
        )
      },
      // ========== PHASE 3: SRS ROUTES ==========
      {
        path: 'dashboard',
        element: (
          <DashboardAccessGuard>
            <RouteSuspense>
              <UserDashboard />
            </RouteSuspense>
          </DashboardAccessGuard>
        )
      },
      {
        path: 'review/:deckId',
        element: (
          <RouteSuspense>
            <FlashcardReviewPage />
          </RouteSuspense>
        )
      },
      {
        path: 'statistics/:deckId',
        element: (
          <RouteSuspense>
            <StatisticsDashboard />
          </RouteSuspense>
        )
      },
      // ========== JLPT ROUTES ==========
      // ✅ Route cụ thể hơn phải được đặt TRƯỚC route tổng quát hơn
      {
        path: 'jlpt',
        element: (
          <RouteSuspense>
            <JLPTPage />
          </RouteSuspense>
        )
      },
      // Route cho bài thi kiến thức (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/knowledge',
        element: (
          <RouteSuspense>
            <ExamKnowledgePage />
          </RouteSuspense>
        )
      },
      // Route cho bài thi nghe (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/listening',
        element: (
          <RouteSuspense>
            <ExamListeningPage />
          </RouteSuspense>
        )
      },
      // Route cho kết quả bài thi (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/result',
        element: (
          <RouteSuspense>
            <JLPTExamResultPage />
          </RouteSuspense>
        )
      },
      // ✅ NEW: Route cho trang xem đáp án và giải thích (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/answers',
        element: (
          <RouteSuspense>
            <ExamAnswersPage />
          </RouteSuspense>
        )
      },
      // Route cho exam detail (cụ thể hơn levelId)
      {
        path: 'jlpt/:levelId/:examId',
        element: (
          <RouteSuspense>
            <JLPTExamDetailPage />
          </RouteSuspense>
        )
      },
      // Route cho level (tổng quát hơn)
      {
        path: 'jlpt/:levelId',
        element: (
          <RouteSuspense>
            <DynamicJLPTLevelPage />
          </RouteSuspense>
        )
      },
      // ========== OTHER ROUTES ==========
      {
        path: 'about',
        element: (
          <RouteSuspense>
            <AboutPage />
          </RouteSuspense>
        )
      },
      // ✅ NEW: Login Page
      {
        path: 'login',
        element: (
          <RouteSuspense>
            <LoginPage />
          </RouteSuspense>
        )
      },
      // ✅ NEW: Register Page
      {
        path: 'register',
        element: (
          <RouteSuspense>
            <RegisterPage />
          </RouteSuspense>
        )
      },
      // ✅ NEW: Profile Page (Protected - Requires login)
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <RouteSuspense>
              <ProfilePage />
            </RouteSuspense>
          </ProtectedRoute>
        )
      },
      // ✅ NEW: Admin Routes (Protected - Admin only)
      {
        path: 'admin',
        element: (
          <ProtectedRoute adminOnly={true}>
            <RouteSuspense>
              <AdminLayout />
            </RouteSuspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <RouteSuspense>
                <AdminDashboardPage />
              </RouteSuspense>
            )
          },
          {
            path: 'quiz-editor',
            element: (
              <RouteSuspense>
                <QuizEditorPage />
              </RouteSuspense>
            )
          },
          {
            path: 'users',
            element: (
              <RouteSuspense>
                <UsersManagementPage />
              </RouteSuspense>
            )
          },
          {
            path: 'content',
            element: (
              <RouteSuspense>
                <ContentManagementPage />
              </RouteSuspense>
            )
          },
          {
            path: 'exams',
            element: (
              <RouteSuspense>
                <ExamManagementPage />
              </RouteSuspense>
            )
          },
          {
            path: 'export-import',
            element: (
              <RouteSuspense>
                <ExportImportPage />
              </RouteSuspense>
            )
          },
          {
            path: 'settings',
            element: (
              <RouteSuspense>
                <SettingsPage />
              </RouteSuspense>
            )
          },
          {
            path: 'new-control',
            element: (
              <RouteSuspense>
                <NewControlPage />
              </RouteSuspense>
            )
          },
          {
            path: 'notifications',
            element: (
              <RouteSuspense>
                <NotificationManagementPage />
              </RouteSuspense>
            )
          }
        ]
      },
      // ✅ NEW: Editor Routes (Protected - Editor only)
      {
        path: 'editor',
        element: (
          <ProtectedRoute editorOnly={true}>
            <RouteSuspense>
              <EditorLayout />
            </RouteSuspense>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <RouteSuspense>
                <EditorDashboardPage />
              </RouteSuspense>
            )
          },
          {
            path: 'quiz-editor',
            element: (
              <RouteSuspense>
                <QuizEditorPage />
              </RouteSuspense>
            )
          },
          {
            path: 'exams',
            element: (
              <RouteSuspense>
                <ExamManagementPage />
              </RouteSuspense>
            )
          }
        ]
      },
      // ========== DEV/EXAMPLE ROUTES ==========
      ...(import.meta.env.DEV
        ? [
            {
              path: 'examples/translation',
              element: (
                <RouteSuspense>
                  <TranslationExample />
                </RouteSuspense>
              )
            },
            {
              path: 'test-i18n',
              element: (
                <RouteSuspense>
                  <LanguageTestComponent />
                </RouteSuspense>
              )
            },
            {
              path: 'test-i18n-simple',
              element: (
                <RouteSuspense>
                  <SimpleTranslationTest />
                </RouteSuspense>
              )
            },
            {
              path: 'debug-i18n',
              element: (
                <RouteSuspense>
                  <DebugTranslationTest />
                </RouteSuspense>
              )
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
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
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

// ✅ PHASE 5: Setup route prefetching and memory optimization after initial render
setTimeout(async () => {
  try {
    // Dynamic import to avoid build failures if files are not committed
    const { prefetchCriticalRoutes } = await import('./utils/routePrefetch');
    const { setupAutoCleanup } = await import('./utils/memoryOptimization');
    
    // Prefetch critical routes when idle
    prefetchCriticalRoutes();
    
    // Setup automatic memory cleanup (every 5 minutes)
    setupAutoCleanup(5 * 60 * 1000);
    
    console.log('✅ [Phase 5] Route prefetching and memory optimization enabled');
  } catch (err) {
    // Silently fail if files are not available (should not happen in production)
    console.warn('[Phase 5] Could not load optimization utilities:', err.message);
  }
}, 3000); // Wait 3 seconds after initial load