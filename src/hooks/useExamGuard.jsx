// src/hooks/useExamGuard.jsx - ✅ FINAL V3: Logic hoàn chỉnh với Answers page
import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Modal } from 'antd';

/**
 * Hook bảo vệ điều hướng - LOGIC HOÀN CHỈNH
 * 
 * FLOW CHUẨN:
 * 1. Detail (lần đầu) → Click Knowledge → KHÔNG cảnh báo (chưa vào)
 * 2. Knowledge (đã vào) → Rời đi → CÓ cảnh báo (dù chưa trả lời)
 * 3. Knowledge submit → Detail (unlock Listening) → CÓ cảnh báo (trừ đi Listening)
 * 4. Listening (đã vào) → Rời đi → CÓ cảnh báo (dù chưa trả lời)
 * 5. Cả 2 xong → Detail → CÓ cảnh báo (có nút Result/Retry)
 * 6. Result → Answers → KHÔNG cảnh báo (xem đáp án)
 * 7. Answers → Rời đi → CÓ cảnh báo (vẫn trong phạm vi bài thi)
 */
export function useExamGuard() {
  const navigateRouter = useNavigate();
  const location = useLocation();
  const { levelId, examId } = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  // ✅ NEW LOGIC: Kiểm tra trạng thái bài thi
  const getExamStatus = useCallback(() => {
    if (!levelId || !examId) return { shouldWarn: false, reason: 'no-exam-route' };

    const knowledgeCompleted = localStorage.getItem(`exam-${levelId}-${examId}-knowledge-completed`) === 'true';
    const listeningCompleted = localStorage.getItem(`exam-${levelId}-${examId}-listening-completed`) === 'true';

    const isKnowledgePage = location.pathname.includes('/knowledge');
    const isListeningPage = location.pathname.includes('/listening');
    const isDetailPage = location.pathname === `/jlpt/${levelId}/${examId}`;
    const isResultPage = location.pathname.includes('/result');
    const isAnswersPage = location.pathname.includes('/answers');

    // ✅ Case 1: Đang ở Knowledge page → LUÔN cảnh báo (đã vào = đang làm)
    if (isKnowledgePage && !knowledgeCompleted) {
      return { shouldWarn: true, reason: 'knowledge-in-progress' };
    }

    // ✅ Case 2: Đang ở Listening page → LUÔN cảnh báo (đã vào = đang làm)
    if (isListeningPage && !listeningCompleted) {
      return { shouldWarn: true, reason: 'listening-in-progress' };
    }

    // ✅ Case 3: Ở Detail page VÀ đã hoàn thành Knowledge (unlock Listening)
    if (isDetailPage && knowledgeCompleted && !listeningCompleted) {
      return { shouldWarn: true, reason: 'detail-knowledge-done-listening-pending' };
    }

    // ✅ Case 4: Ở Detail page VÀ đã hoàn thành CẢ 2 (có nút Result/Retry)
    if (isDetailPage && knowledgeCompleted && listeningCompleted) {
      return { shouldWarn: true, reason: 'detail-both-completed' };
    }

    // ✅ Case 5: Ở Result page → LUÔN cảnh báo (trừ khi đi Answers)
    if (isResultPage) {
      return { shouldWarn: true, reason: 'result-page' };
    }

    // ✅ Case 6: Ở Answers page → LUÔN cảnh báo (vẫn trong phạm vi bài thi)
    if (isAnswersPage) {
      return { shouldWarn: true, reason: 'answers-page' };
    }

    // Case 7: Không cần cảnh báo (Detail page lần đầu, chưa bắt đầu gì)
    return { shouldWarn: false, reason: 'safe-to-leave' };
  }, [levelId, examId, location.pathname]);

  // ✅ Kiểm tra xem đích đến có phải là Listening của cùng đề không
  const isNavigatingToSameExamListening = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    const expectedListeningPath = `/jlpt/${levelId}/${examId}/listening`;
    return targetPath === expectedListeningPath;
  }, [levelId, examId]);

  // ✅ Kiểm tra xem đích đến có phải là Result của cùng đề không
  const isNavigatingToSameExamResult = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    const expectedResultPath = `/jlpt/${levelId}/${examId}/result`;
    return targetPath === expectedResultPath;
  }, [levelId, examId]);

  // ✅ NEW: Kiểm tra xem đích đến có phải là Answers của cùng đề không
  const isNavigatingToSameExamAnswers = useCallback((targetPath) => {
    if (!levelId || !examId || !targetPath) return false;
    
    const expectedAnswersPath = `/jlpt/${levelId}/${examId}/answers`;
    return targetPath === expectedAnswersPath;
  }, [levelId, examId]);

  // ✅ Kiểm tra có cần cảnh báo không (có exception cho Listening, Result, Answers)
  const shouldShowWarning = useCallback((targetPath = null) => {
    const status = getExamStatus();
    
    // ✅ EXCEPTION 1: Ở Detail (Knowledge xong) → Đi Listening cùng đề → KHÔNG cảnh báo
    if (status.reason === 'detail-knowledge-done-listening-pending' && targetPath) {
      if (isNavigatingToSameExamListening(targetPath)) {
        return false; // ✅ Cho phép chuyển sang Listening
      }
    }
    
    // ✅ EXCEPTION 2: Ở Detail (cả 2 xong) → Đi Result cùng đề → KHÔNG cảnh báo
    if (status.reason === 'detail-both-completed' && targetPath) {
      if (isNavigatingToSameExamResult(targetPath)) {
        return false; // ✅ Cho phép xem kết quả
      }
    }
    
    // ✅ EXCEPTION 3: Ở Result → Đi Answers cùng đề → KHÔNG cảnh báo
    if (status.reason === 'result-page' && targetPath) {
      if (isNavigatingToSameExamAnswers(targetPath)) {
        return false; // ✅ Cho phép xem đáp án
      }
    }

    // ✅ EXCEPTION 4: Ở Answers → Quay lại Result cùng đề → KHÔNG cảnh báo
    if (status.reason === 'answers-page' && targetPath) {
      if (isNavigatingToSameExamResult(targetPath)) {
        return false; // ✅ Cho phép quay lại kết quả
      }
    }
    
    return status.shouldWarn;
  }, [getExamStatus, isNavigatingToSameExamListening, isNavigatingToSameExamResult, isNavigatingToSameExamAnswers]);

  // ✅ Xóa dữ liệu bài thi
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

  // ✅ Xử lý beforeunload (Reload/Close tab) - Browser alert bắt buộc
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldShowWarning()) {
        e.preventDefault();
        e.returnValue = '⚠️ Bài làm của bạn chưa được hoàn thành. Bạn có chắc muốn rời khỏi?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldShowWarning]);

  // ✅ Xử lý Browser Back/Forward - Modal Antd (luôn gắn listener, kiểm tra khi xảy ra)
  useEffect(() => {
    const handlePopState = (e) => {
      // Nếu không cần cảnh báo ở thời điểm này → cho phép back bình thường
      if (!shouldShowWarning()) {
        return;
      }
      e.preventDefault();
      // Đẩy lại state để "khóa" back và hiển thị modal
      window.history.pushState(null, '', location.pathname);
      setModalVisible(true);
      setPendingPath('back');
    };

    // Đẩy nhiều state vào history để chặn swipe-back iOS vượt quá 1 bước
    if (shouldShowWarning()) {
      window.history.pushState({ guard: true }, '', location.pathname);
      window.history.pushState({ guard: true }, '', location.pathname);
      window.history.pushState({ guard: true }, '', location.pathname);
    }
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, shouldShowWarning]);

  // ✅ Khi quay lại từ bfcache (iOS) hoặc tab trở lại foreground, đảm bảo guard được tái thiết lập
  useEffect(() => {
    const rearmGuard = () => {
      if (!shouldShowWarning()) return;
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
  }, [location, shouldShowWarning]);

  // ✅ Intercept in-app link clicks globally (footer, breadcrumbs with <a>, etc.)
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

  // ✅ Hàm điều hướng với cảnh báo (Header, Breadcrumbs, buttons)
  const handleNavigateWithWarning = useCallback((path) => {
    if (shouldShowWarning(path)) {
      setPendingPath(path);
      setModalVisible(true);
    } else {
      navigateRouter(path);
    }
  }, [shouldShowWarning, navigateRouter]);

  // ✅ Xử lý khi đồng ý rời đi
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

  // ✅ Xử lý khi hủy
  const cancelLeave = () => {
    setModalVisible(false);
    setPendingPath(null);
    
    if (pendingPath === 'back') {
      window.history.pushState(null, '', location.pathname);
    }
  };

  // ✅ Modal cảnh báo Antd
  const WarningModal = (
    <Modal
      title="⚠️ BẠN CÓ BÀI THI ĐANG LÀM DỞ!"
      open={modalVisible}
      onOk={confirmLeave}
      onCancel={cancelLeave}
      okText="Đồng ý (Xóa dữ liệu)"
      cancelText="Ở lại"
      okButtonProps={{ danger: true }}
      centered
      maskClosable={true}
      closable={true}
      onClose={cancelLeave}
    >
      <div className="py-4">
        <p className="mb-3">
          • Nếu bấm <strong className="text-red-600">Đồng ý</strong>: 
          Dữ liệu bài làm sẽ bị <strong>XÓA HOÀN TOÀN</strong> và bạn phải làm lại từ đầu.
        </p>
        <p className="mb-3">
          • Nếu bấm <strong className="text-green-600">Ở lại</strong>: 
          Bạn sẽ tiếp tục làm bài thi.
        </p>
        <p className="text-red-600 font-semibold mt-4">
          ⚠️ Bạn có chắc chắn muốn rời khỏi không?
        </p>
      </div>
    </Modal>
  );

  return {
    shouldShowWarning: shouldShowWarning(),
    clearExamData,
    navigate: handleNavigateWithWarning,
    WarningModal,
  };
}