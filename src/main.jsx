import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';

import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import QuizEditorPage from './pages/admin/QuizEditorPage.jsx';
import UsersManagementPage from './pages/admin/UsersManagementPage.jsx';
import ContentManagementPage from './pages/admin/ContentManagementPage.jsx';
import LevelPage from './features/books/pages/LevelPage.jsx';
import LevelN1Page from './features/books/pages/LevelN1Page.jsx';

import BookDetailPage from './features/books/pages/BookDetailPage.jsx';
import QuizPage from './features/books/pages/QuizPage.jsx';

// JLPT imports
import JLPTPage from './features/jlpt/pages/JLPTPage.jsx';
import JLPTLevelN1Page from './features/jlpt/pages/JLPTLevelN1Page.jsx';

import JLPTExamDetailPage from './features/jlpt/pages/JLPTExamDetailPage.jsx';
import ExamKnowledgePage from './features/jlpt/pages/ExamKnowledgePage.jsx';
import ExamListeningPage from './features/jlpt/pages/ExamListeningPage.jsx';
import JLPTExamResultPage from './features/jlpt/pages/JLPTExamResultPage.jsx';
// ✅ NEW: Import ExamAnswersPage
import ExamAnswersPage from './features/jlpt/pages/ExamAnswersPage.jsx';

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
  switch (levelId) {
    case 'n1': return <LevelN1Page />;
    default: return <LevelPlaceholder levelId={levelId} type="LEVEL" />;
  }
}

// Wrapper component cho route động JLPT
function DynamicJLPTLevelPage() {
  const { levelId } = useParams();
  if (!levelId) {
    return <NotFoundPage />;
  }
  switch (levelId) {
    case 'n1': return <JLPTLevelN1Page />;
    default: return <LevelPlaceholder levelId={levelId} type="JLPT" />;
  }
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
        path: 'level/:levelId/:bookId/lesson/:lessonId', 
        element: <QuizPage /> 
      },
      // ========== JLPT ROUTES ==========
      {
        path: 'jlpt',
        element: <JLPTPage />
      },
      {
        path: 'jlpt/:levelId',
        element: <DynamicJLPTLevelPage />
      },
      {
        path: 'jlpt/:levelId/:examId',
        element: <JLPTExamDetailPage />
      },
      // Route cho bài thi kiến thức
      {
        path: 'jlpt/:levelId/:examId/knowledge',
        element: <ExamKnowledgePage />
      },
      // Route cho bài thi nghe
      {
        path: 'jlpt/:levelId/:examId/listening',
        element: <ExamListeningPage />
      },
      // Route cho kết quả bài thi
      {
        path: 'jlpt/:levelId/:examId/result',
        element: <JLPTExamResultPage />
      },
      // ✅ NEW: Route cho trang xem đáp án và giải thích
      {
        path: 'jlpt/:levelId/:examId/answers',
        element: <ExamAnswersPage />
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
          }
        ]
      },
      { 
        path: '*', 
        element: <NotFoundPage /> 
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);