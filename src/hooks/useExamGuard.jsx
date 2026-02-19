// src/hooks/useExamGuard.jsx - FINAL V5: Chặn lùi trong cùng exam flow
import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import WarningModal from '../components/WarningModal.jsx';

/**
 * Hook bảo vệ điều hướng - LOGIC HOÀN CHỈNH V5
 * 
 * FLOW CHUẨN:
 * 1. Detail (lần đầu) → Click Knowledge → KHÔNG cảnh báo (tiến, chưa vào)
 * 2. Knowledge (đã vào) → Back Detail → CÓ cảnh báo (lùi, không được phép)
 * 3. Knowledge submit → Detail (unlock Listening) → KHÔNG cảnh báo (tiến, trong cùng exam)
 * 4. Detail (Knowledge done) → Listening → KHÔNG cảnh báo (tiến, trong cùng exam)
 * 5. Listening (đã vào) → Back Detail → CÓ cảnh báo (lùi, không được phép)
 * 6. Cả 2 xong → Detail → Result → KHÔNG cảnh báo (tiến, trong cùng exam)
 * 7. Result → Answers → KHÔNG cảnh báo (tiến, trong cùng exam)
 * 8. Answers → Back Result/Detail → CÓ cảnh báo (lùi, không được phép)
 * 
 * QUAN TRỌNG: 
 *    - CHỈ cho phép đi TIẾN trong cùng exam flow: Detail → Knowledge → Listening → Result → Answers
 *    - KHÔNG cho phép đi LÙI trong cùng exam flow: Knowledge → Detail, Listening → Knowledge, etc.
 *    - Cảnh báo khi LÙI trong cùng exam flow hoặc RỜI KHỎI exam flow
 */
export function useExamGuard() {
  const navigateRouter = useNavigate();
  const location = useLocation();
  const { levelId, examId } = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  
  // Memoize current warning status để tránh gọi lại quá nhiều
  const [currentWarningStatus, setCurrentWarningStatus] = useState(false);
  
  // Lưu path trước đó để kiểm tra khi back
  const previousPathRef = useRef(location.pathname);

  // NEW LOGIC: Kiểm tra trạng thái bài thi
  const getExamStatus = useCallback(() => {
    if (!levelId || !examId) return { shouldWarn: false, reason: 'no-exam-route' };

    const knowledgeCompleted = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-completed`) === 'true';
    const listeningCompleted = localStorage.getItem(`exam-${levelId}-${examId}-listening-completed`) === 'true';

    const isKnowledgePage = location.pathname.includes('/knowledge');
    const isListeningPage = location.pathname.includes('/listening');
    const isDetailPage = location.pathname === `/jlpt/${levelId}/${examId}`;
    const isResultPage = location.pathname.includes('/result');
    const isAnswersPage = location.pathname.includes('/answers');

    // Case 1: Đang ở Knowledge page → LUÔN cảnh báo (đã vào = đang làm)
    if (isKnowledgePage && !knowledgeCompleted) {
      return { shouldWarn: true, reason: 'knowledge-in-progress' };
    }

    // Case 2: Đang ở Listening page → LUÔN cảnh báo (đã vào = đang làm)
    if (isListeningPage && !listeningCompleted) {
      return { shouldWarn: true, reason: 'listening-in-progress' };
    }

    // Case 3: Ở Detail page VÀ đã hoàn thành Knowledge (unlock Listening)
    if (isDetailPage && knowledgeCompleted && !listeningCompleted) {
      return { shouldWarn: true, reason: 'detail-knowledge-done-listening-pending' };
    }

    // Case 4: Ở Detail page VÀ đã hoàn thành CẢ 2 (có nút Result/Retry)
    if (isDetailPage && knowledgeCompleted && listeningCompleted) {
      return { shouldWarn: true, reason: 'detail-both-completed' };
    }

    // Case 5: Ở Result page → LUÔN cảnh báo (trừ khi đi Answers)
    if (isResultPage) {
      return { shouldWarn: true, reason: 'result-page' };
    }

    // Case 6: Ở Answers page → LUÔN cảnh báo (vẫn trong phạm vi bài thi)
    if (isAnswersPage) {
      return { shouldWarn: true, reason: 'answers-page' };
    }

    // Case 7: Không cần cảnh báo (Detail page lần đầu, chưa bắt đầu gì)
    return { shouldWarn: false, reason: 'safe-to-leave' };
  }, [levelId, examId, location.pathname]);

  // Kiểm tra xem đích đến có phải là Knowledge của cùng đề không
  const isNavigatingToSameExamKnowledge = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    // Normalize path: remove query string and hash
    const normalizedPath = targetPath.split('?')[0].split('#')[0];
    const expectedKnowledgePath = `/jlpt/${levelId}/${examId}/knowledge`;
    
    return normalizedPath === expectedKnowledgePath;
  }, [levelId, examId]);

  // Kiểm tra xem đích đến có phải là Listening của cùng đề không
  const isNavigatingToSameExamListening = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    // Normalize path: remove query string and hash
    const normalizedPath = targetPath.split('?')[0].split('#')[0];
    const expectedListeningPath = `/jlpt/${levelId}/${examId}/listening`;
    
    return normalizedPath === expectedListeningPath;
  }, [levelId, examId]);

  // Kiểm tra xem đích đến có phải là Result của cùng đề không
  const isNavigatingToSameExamResult = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    // Normalize path: remove query string and hash
    const normalizedPath = targetPath.split('?')[0].split('#')[0];
    const expectedResultPath = `/jlpt/${levelId}/${examId}/result`;
    
    return normalizedPath === expectedResultPath;
  }, [levelId, examId]);

  // NEW: Kiểm tra xem đích đến có phải là Answers của cùng đề không
  const isNavigatingToSameExamAnswers = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    // Normalize path: remove query string and hash
    const normalizedPath = targetPath.split('?')[0].split('#')[0];
    const expectedAnswersPath = `/jlpt/${levelId}/${examId}/answers`;
    
    return normalizedPath === expectedAnswersPath;
  }, [levelId, examId]);

  // NEW: Kiểm tra xem đích đến có phải là Detail của cùng đề không
  const isNavigatingToSameExamDetail = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    // Normalize path: remove query string and hash
    const normalizedPath = targetPath.split('?')[0].split('#')[0];
    const expectedDetailPath = `/jlpt/${levelId}/${examId}`;
    
    return normalizedPath === expectedDetailPath;
  }, [levelId, examId]);

  // NEW: Xác định thứ tự các trang trong exam flow
  const getExamPageOrder = useCallback((path) => {
    if (!levelId || !examId || !path) return -1;
    
    const normalizedPath = path.split('?')[0].split('#')[0];
    const examBasePath = `/jlpt/${levelId}/${examId}`;
    
    // Thứ tự: Detail (0) < Knowledge (1) < Listening (2) < Result (3) < Answers (4)
    if (normalizedPath === examBasePath) return 0; // Detail
    if (normalizedPath === `${examBasePath}/knowledge`) return 1; // Knowledge
    if (normalizedPath === `${examBasePath}/listening`) return 2; // Listening
    if (normalizedPath === `${examBasePath}/result`) return 3; // Result
    if (normalizedPath === `${examBasePath}/answers`) return 4; // Answers
    
    return -1; // Không phải trang trong exam flow
  }, [levelId, examId]);

  // NEW: Kiểm tra xem có đang điều hướng TRONG CÙNG exam flow không
  const isNavigatingWithinSameExam = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    const currentOrder = getExamPageOrder(location.pathname);
    const targetOrder = getExamPageOrder(targetPath);
    
    // Cả hai đều là trang trong exam flow
    return currentOrder >= 0 && targetOrder >= 0;
  }, [levelId, examId, location.pathname, getExamPageOrder]);

  // NEW: Kiểm tra xem có đang đi LÙI trong cùng exam flow không
  const isNavigatingBackwardInSameExam = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    const currentOrder = getExamPageOrder(location.pathname);
    const targetOrder = getExamPageOrder(targetPath);
    
    // Nếu cả hai đều trong exam flow VÀ targetOrder < currentOrder → đang lùi
    return currentOrder >= 0 && targetOrder >= 0 && targetOrder < currentOrder;
  }, [levelId, examId, location.pathname, getExamPageOrder]);

  // Kiểm tra có cần cảnh báo không (chặn lùi trong cùng exam flow)
  const shouldShowWarning = useCallback((targetPath = null) => {
    const status = getExamStatus();
    
    // Chỉ log trong dev mode và khi có targetPath (để debug navigation)
    if (import.meta.env.DEV && targetPath) {
      console.log('shouldShowWarning check:', { reason: status.reason, targetPath, shouldWarn: status.shouldWarn });
    }
    
    // QUAN TRỌNG: Nếu đang đi LÙI trong cùng exam flow → CẢNH BÁO
    if (targetPath && isNavigatingBackwardInSameExam(targetPath)) {
      if (import.meta.env.DEV) {
        console.log('⚠️ Blocking backward navigation within same exam flow:', targetPath);
      }
      return true; // Chặn lùi trong cùng exam flow
    }
    
    // EXCEPTION 0: Ở Detail (lần đầu, chưa làm gì) → Đi Knowledge cùng đề → KHÔNG cảnh báo (tiến)
    if (status.reason === 'safe-to-leave' && targetPath) {
      if (isNavigatingToSameExamKnowledge(targetPath)) {
        return false; // Cho phép bắt đầu Knowledge (tiến)
      }
    }
    
    // EXCEPTION 1: Ở Detail (Knowledge xong) → Đi Listening cùng đề → KHÔNG cảnh báo (tiến)
    if (status.reason === 'detail-knowledge-done-listening-pending' && targetPath) {
      const isListening = isNavigatingToSameExamListening(targetPath);
      if (import.meta.env.DEV && isListening) {
        console.log('Exception 1: Allowing navigation to Listening (forward)');
      }
      if (isListening) {
        return false; // Cho phép chuyển sang Listening (tiến)
      }
    }
    
    // EXCEPTION 2: Ở Detail (cả 2 xong) → Đi Result cùng đề → KHÔNG cảnh báo (tiến)
    if (status.reason === 'detail-both-completed' && targetPath) {
      if (isNavigatingToSameExamResult(targetPath)) {
        return false; // Cho phép xem kết quả (tiến)
      }
    }
    
    // EXCEPTION 3: Ở Result → Đi Answers cùng đề → KHÔNG cảnh báo (tiến)
    if (status.reason === 'result-page' && targetPath) {
      if (isNavigatingToSameExamAnswers(targetPath)) {
        return false; // Cho phép xem đáp án (tiến)
      }
    }

    // Nếu rời khỏi exam flow hoặc các trường hợp khác → CẢNH BÁO
    return status.shouldWarn;
  }, [getExamStatus, isNavigatingToSameExamKnowledge, isNavigatingToSameExamListening, isNavigatingToSameExamResult, isNavigatingToSameExamAnswers, isNavigatingBackwardInSameExam]);

  // Xóa dữ liệu bài thi
  const clearExamData = useCallback(() => {
    if (!levelId || !examId) return;
    
    // Xóa tất cả data liên quan
    const keysToRemove = [
      `exam-${levelId}-${examId}-knowledge`,
      `exam-${levelId}-${examId}-knowledge-score`,
      `exam-${levelId}-${examId}-knowledge-completed`,
      `exam-${levelId}-${examId}-knowledge-breakdown`,
      `exam-${levelId}-${examId}-listening`,
      `exam-${levelId}-${examId}-listening-score`,
      `exam-${levelId}-${examId}-listening-completed`,
      `exam-${levelId}-${examId}-listening-breakdown`,
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, [levelId, examId]);

  // Cập nhật currentWarningStatus khi location hoặc exam status thay đổi
  useEffect(() => {
    const status = shouldShowWarning();
    setCurrentWarningStatus(status);
  }, [shouldShowWarning, location.pathname, levelId, examId]);

  // Xử lý beforeunload (Reload/Close tab) - Browser alert bắt buộc
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentWarningStatus) {
        e.preventDefault();
        e.returnValue = '⚠️ Bài làm của bạn chưa được hoàn thành. Bạn có chắc muốn rời khỏi?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentWarningStatus]);

  // Cập nhật previousPathRef khi location thay đổi
  useEffect(() => {
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  // Xử lý Browser Back/Forward - Modal Antd (luôn gắn listener, kiểm tra khi xảy ra)
  useEffect(() => {
    // Lưu path hiện tại trước khi kiểm tra
    const currentPath = location.pathname;
    const currentOrder = getExamPageOrder(currentPath);
    
    const handlePopState = (e) => {
      // Nếu không cần cảnh báo ở thời điểm này → cho phép back bình thường
      if (!currentWarningStatus) {
        return;
      }
      
      // NEW: Kiểm tra xem có đang back trong cùng exam flow không
      // Khi popstate xảy ra, window.location.pathname đã thay đổi (browser đã navigate)
      const newPath = window.location.pathname;
      const newOrder = getExamPageOrder(newPath);
      
      // Nếu cả hai đều trong exam flow VÀ đang lùi (newOrder < currentOrder) → chặn
      if (currentOrder >= 0 && newOrder >= 0 && newOrder < currentOrder) {
        // Chặn back trong cùng exam flow
        if (import.meta.env.DEV) {
          console.log('⚠️ Blocking browser back within same exam flow:', { from: currentPath, to: newPath, fromOrder: currentOrder, toOrder: newOrder });
        }
        // Navigate về trang cũ bằng React Router
        navigateRouter(currentPath, { replace: true });
        // Hiển thị modal cảnh báo
        setModalVisible(true);
        setPendingPath('back');
        return;
      }
      
      // Nếu rời khỏi exam flow → chặn và cảnh báo
      if (currentOrder >= 0 && newOrder < 0) {
        // Navigate về trang cũ bằng React Router
        navigateRouter(currentPath, { replace: true });
        // Hiển thị modal cảnh báo
        setModalVisible(true);
        setPendingPath('back');
        return;
      }
      
      // Nếu đi tiến trong cùng exam flow hoặc không liên quan → cho phép
      if (import.meta.env.DEV) {
        console.log('✅ Allowing browser navigation:', { from: currentPath, to: newPath, fromOrder: currentOrder, toOrder: newOrder });
      }
    };

    // Đẩy nhiều state vào history để chặn swipe-back iOS vượt quá 1 bước
    // CHỈ khi cần cảnh báo VÀ không phải đang ở trang đầu tiên của exam flow
    if (currentWarningStatus) {
      // Kiểm tra xem có phải trang đầu tiên không (Detail page, chưa làm gì)
      const isFirstPage = location.pathname === `/jlpt/${levelId}/${examId}` && 
                         !localStorage.getItem(`exam-${levelId}-${examId}-knowledge-completed`);
      
      // Nếu không phải trang đầu tiên → chặn back
      if (!isFirstPage) {
        window.history.pushState({ guard: true }, '', location.pathname);
        window.history.pushState({ guard: true }, '', location.pathname);
        window.history.pushState({ guard: true }, '', location.pathname);
      }
    }
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, currentWarningStatus, levelId, examId, getExamPageOrder, navigateRouter]);

  // Khi quay lại từ bfcache (iOS) hoặc tab trở lại foreground, đảm bảo guard được tái thiết lập
  useEffect(() => {
    const rearmGuard = () => {
      if (!currentWarningStatus) return;
      window.history.pushState({ guard: true }, '', location.pathname);
      window.history.pushState({ guard: true }, '', location.pathname);
    };
    window.addEventListener('pageshow', rearmGuard);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        rearmGuard();
      }
    });
    return () => {
      window.removeEventListener('pageshow', rearmGuard);
      document.removeEventListener('visibilitychange', rearmGuard);
    };
  }, [location, currentWarningStatus]);

  // Intercept in-app link clicks globally (footer, breadcrumbs with <a>, etc.)
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Only intercept left-clicks without modifier keys
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target.closest && e.target.closest('a');
      if (!anchor) return;

      // External links or special protocols should pass through
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (anchor.target === '_blank' || url.protocol !== window.location.protocol) return;

      // Build pathname + search for targetPath
      const targetPath = url.pathname + url.search + url.hash;

      if (shouldShowWarning(targetPath)) {
        e.preventDefault();
        setPendingPath(targetPath);
        setModalVisible(true);
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [shouldShowWarning]);

  // Hàm điều hướng với cảnh báo (Header, Breadcrumbs, buttons)
  const handleNavigateWithWarning = useCallback((path) => {
    if (shouldShowWarning(path)) {
      setPendingPath(path);
      setModalVisible(true);
    } else {
      navigateRouter(path);
    }
  }, [shouldShowWarning, navigateRouter]);

  // Xử lý khi đồng ý rời đi
  const confirmLeave = () => {
    clearExamData();
    setModalVisible(false);
    
    if (pendingPath === 'back') {
      window.history.back();
    } else if (pendingPath) {
      navigateRouter(pendingPath);
    }
    
    setPendingPath(null);
  };

  // Xử lý khi hủy
  const cancelLeave = () => {
    setModalVisible(false);
    setPendingPath(null);
    
    if (pendingPath === 'back') {
      window.history.pushState(null, '', location.pathname);
    }
  };

  // Modal cảnh báo - NEO BRUTALISM
  const WarningModalComponent = (
    <WarningModal
      isOpen={modalVisible}
      onConfirm={confirmLeave}
      onCancel={cancelLeave}
    />
  );

  return {
    shouldShowWarning: currentWarningStatus,
    clearExamData,
    navigate: handleNavigateWithWarning,
    WarningModal: WarningModalComponent,
  };
}