import React from 'react';
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
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AccessGuard from './components/AccessGuard.jsx';
import DashboardAccessGuard from './components/DashboardAccessGuard.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import EditorLayout from './components/editor/EditorLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import QuizEditorPage from './pages/admin/QuizEditorPage.jsx';
import UsersManagementPage from './pages/admin/UsersManagementPage.jsx';
import ContentManagementPage from './pages/admin/ContentManagementPage.jsx';
import ExamManagementPage from './pages/admin/ExamManagementPage.jsx';
import ExportImportPage from './pages/admin/ExportImportPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';
import NewControlPage from './pages/admin/NewControlPage.jsx';
import DashboardAccessPage from './pages/admin/DashboardAccessPage.jsx';
import NotificationManagementPage from './pages/admin/NotificationManagementPage.jsx';
import EditorDashboardPage from './pages/editor/EditorDashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LevelPage from './features/books/pages/LevelPage.jsx';
import LevelN1Page from './features/books/pages/LevelN1Page.jsx';
import LevelN2Page from './features/books/pages/LevelN2Page.jsx';
import LevelN3Page from './features/books/pages/LevelN3Page.jsx';
import LevelN4Page from './features/books/pages/LevelN4Page.jsx';
import LevelN5Page from './features/books/pages/LevelN5Page.jsx';

import BookDetailPage from './features/books/pages/BookDetailPage.jsx';
import LessonPage from './features/books/pages/LessonPage.jsx';
import QuizPage from './features/books/pages/QuizPage.jsx';

// JLPT imports
import JLPTPage from './features/jlpt/pages/JLPTPage.jsx';
import JLPTLevelN1Page from './features/jlpt/pages/JLPTLevelN1Page.jsx';
import JLPTLevelN2Page from './features/jlpt/pages/JLPTLevelN2Page.jsx';
import JLPTLevelN3Page from './features/jlpt/pages/JLPTLevelN3Page.jsx';
import JLPTLevelN4Page from './features/jlpt/pages/JLPTLevelN4Page.jsx';
import JLPTLevelN5Page from './features/jlpt/pages/JLPTLevelN5Page.jsx';

import JLPTExamDetailPage from './features/jlpt/pages/JLPTExamDetailPage.jsx';
import ExamKnowledgePage from './features/jlpt/pages/ExamKnowledgePage.jsx';
import ExamListeningPage from './features/jlpt/pages/ExamListeningPage.jsx';
import JLPTExamResultPage from './features/jlpt/pages/JLPTExamResultPage.jsx';
// ✅ NEW: Import ExamAnswersPage
import ExamAnswersPage from './features/jlpt/pages/ExamAnswersPage.jsx';

// ✅ PHASE 3: SRS Review & Statistics Pages
import FlashcardReviewPage from './pages/FlashcardReviewPage.jsx';
import StatisticsDashboard from './pages/StatisticsDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';

// Example/Test components
import TranslationExample from './components/examples/TranslationExample.jsx';
import LanguageTestComponent from './components/examples/LanguageTestComponent.jsx';
import SimpleTranslationTest from './components/examples/SimpleTranslationTest.jsx';
import DebugTranslationTest from './components/examples/DebugTranslationTest.jsx';

import './styles/index.css';

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
      <PageComponent />
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
      <PageComponent />
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
        element: <LevelPage />
      },
      {
        path: 'level/:levelId',
        element: <DynamicLevelPage />
      },
      {
        path: 'level/:levelId/:bookId',
        element: <BookDetailPage />
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId',
        element: <BookDetailPage />
      },
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId',
        element: <LessonPage />
      },
      // Route cho quiz standalone (khi click "Bắt đầu làm quiz" trong LessonPage)
      {
        path: 'level/:levelId/:bookId/chapter/:chapterId/lesson/:lessonId/quiz',
        element: <QuizPage />
      },
      // Backward compatibility: old route without chapterId
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId',
        element: <LessonPage />
      },
      // Backward compatibility: old quiz route
      {
        path: 'level/:levelId/:bookId/lesson/:lessonId/quiz',
        element: <QuizPage />
      },
      // ========== PHASE 3: SRS ROUTES ==========
      {
        path: 'dashboard',
        element: (
          <DashboardAccessGuard>
            <UserDashboard />
          </DashboardAccessGuard>
        )
      },
      {
        path: 'review/:deckId',
        element: <FlashcardReviewPage />
      },
      {
        path: 'statistics/:deckId',
        element: <StatisticsDashboard />
      },
      // ========== JLPT ROUTES ==========
      // ✅ Route cụ thể hơn phải được đặt TRƯỚC route tổng quát hơn
      {
        path: 'jlpt',
        element: <JLPTPage />
      },
      // Route cho bài thi kiến thức (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/knowledge',
        element: <ExamKnowledgePage />
      },
      // Route cho bài thi nghe (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/listening',
        element: <ExamListeningPage />
      },
      // Route cho kết quả bài thi (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/result',
        element: <JLPTExamResultPage />
      },
      // ✅ NEW: Route cho trang xem đáp án và giải thích (cụ thể nhất)
      {
        path: 'jlpt/:levelId/:examId/answers',
        element: <ExamAnswersPage />
      },
      // Route cho exam detail (cụ thể hơn levelId)
      {
        path: 'jlpt/:levelId/:examId',
        element: <JLPTExamDetailPage />
      },
      // Route cho level (tổng quát hơn)
      {
        path: 'jlpt/:levelId',
        element: <DynamicJLPTLevelPage />
      },
      // ========== OTHER ROUTES ==========
      {
        path: 'about',
        element: <AboutPage />
      },
      // ✅ NEW: Login Page
      {
        path: 'login',
        element: <LoginPage />
      },
      // ✅ NEW: Register Page
      {
        path: 'register',
        element: <RegisterPage />
      },
      // ✅ NEW: Profile Page (Protected - Requires login)
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      // ✅ NEW: Admin Routes (Protected - Admin only)
      {
        path: 'admin',
        element: (
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboardPage />
          },
          {
            path: 'quiz-editor',
            element: <QuizEditorPage />
          },
          {
            path: 'users',
            element: <UsersManagementPage />
          },
          {
            path: 'content',
            element: <ContentManagementPage />
          },
          {
            path: 'exams',
            element: <ExamManagementPage />
          },
          {
            path: 'export-import',
            element: <ExportImportPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
          {
            path: 'new-control',
            element: <NewControlPage />
          },
          {
            path: 'notifications',
            element: <NotificationManagementPage />
          }
        ]
      },
      // ✅ NEW: Editor Routes (Protected - Editor only)
      {
        path: 'editor',
        element: (
          <ProtectedRoute editorOnly={true}>
            <EditorLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <EditorDashboardPage />
          },
          {
            path: 'quiz-editor',
            element: <QuizEditorPage />
          },
          {
            path: 'exams',
            element: <ExamManagementPage />
          }
        ]
      },
      // ========== DEV/EXAMPLE ROUTES ==========
      ...(import.meta.env.DEV
        ? [
            {
              path: 'examples/translation',
              element: <TranslationExample />
            },
            {
              path: 'test-i18n',
              element: <LanguageTestComponent />
            },
            {
              path: 'test-i18n-simple',
              element: <SimpleTranslationTest />
            },
            {
              path: 'debug-i18n',
              element: <DebugTranslationTest />
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
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <DictionaryProvider>
            <RouterProvider router={router} />
          </DictionaryProvider>
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
);