// src/config/searchableItems.js
// 🔍 Searchable Items Registry - All searchable content in the app

/**
 * Định nghĩa tất cả các items có thể search trong app
 * Mỗi item có:
 * - id: unique identifier
 * - title: tên hiển thị
 * - description: mô tả ngắn
 * - keywords: từ khóa để search (bao gồm cả tiếng Việt, tiếng Anh, viết tắt)
 * - category: loại item (page, feature, setting, content, admin)
 * - icon: emoji icon
 * - path: đường dẫn điều hướng
 * - roles: mảng các roles được phép truy cập (null = public)
 * - priority: độ ưu tiên hiển thị (cao hơn = hiển thị trước)
 */

export const SEARCHABLE_ITEMS = [
  // ============================================
  // PAGES - Public pages
  // ============================================
  {
    id: 'page-home',
    title: 'Home',
    description: 'Trang chủ',
    keywords: ['home', 'trang chu', 'main', 'index', 'h'],
    category: 'page',
    icon: '🏠',
    path: '/',
    roles: null, // Public
    priority: 100
  },
  {
    id: 'page-level',
    title: 'Level Selection',
    description: 'Chọn cấp độ học (N1-N5)',
    keywords: ['level', 'cap do', 'n1', 'n2', 'n3', 'n4', 'n5', 'l'],
    category: 'page',
    icon: '📊',
    path: '/level',
    roles: null,
    priority: 95
  },
  {
    id: 'page-jlpt',
    title: 'JLPT Tests',
    description: 'Thi thử JLPT',
    keywords: ['jlpt', 'test', 'thi thu', 'exam', 'j'],
    category: 'page',
    icon: '📝',
    path: '/jlpt',
    roles: null,
    priority: 95
  },
  {
    id: 'page-about',
    title: 'About Me',
    description: 'Câu chuyện của mình',
    keywords: ['about', 've toi', 'story', 'cau chuyen', 'a'],
    category: 'page',
    icon: '💫',
    path: '/about',
    roles: null,
    priority: 80
  },
  {
    id: 'page-profile',
    title: 'My Profile',
    description: 'Thông tin cá nhân',
    keywords: ['profile', 'ca nhan', 'user', 'account', 'p'],
    category: 'page',
    icon: '👤',
    path: '/profile',
    roles: ['user', 'editor', 'admin'],
    priority: 85
  },

  // ============================================
  // FEATURES - App features
  // ============================================
  {
    id: 'feature-dictionary',
    title: 'Dictionary',
    description: 'Tra từ điển JLPT 8,292 từ',
    keywords: ['dictionary', 'tu dien', 'tra tu', 'jlpt words', 'd', 't'],
    category: 'feature',
    icon: '📖',
    path: null, // Feature, not a page
    roles: null,
    priority: 90
  },
  {
    id: 'feature-streak',
    title: 'Learning Streak',
    description: 'Theo dõi chuỗi ngày học liên tục',
    keywords: ['streak', 'chuoi ngay', 'daily', 'progress', 's'],
    category: 'feature',
    icon: '🔥',
    path: null,
    roles: ['user', 'editor', 'admin'],
    priority: 75
  },
  {
    id: 'feature-search',
    title: 'Global Search',
    description: 'Tìm kiếm toàn cục (Ctrl+K)',
    keywords: ['search', 'tim kiem', 'find', 'ctrl k', 'f'],
    category: 'feature',
    icon: '🔍',
    path: null,
    roles: null,
    priority: 85
  },
  {
    id: 'feature-language',
    title: 'Language Switcher',
    description: 'Chuyển đổi ngôn ngữ (VI/EN/JP)',
    keywords: ['language', 'ngon ngu', 'translate', 'vietnamese', 'english', 'japanese'],
    category: 'feature',
    icon: '🌐',
    path: null,
    roles: null,
    priority: 70
  },

  // ============================================
  // JLPT LEVELS - Quick access
  // ============================================
  {
    id: 'level-n5',
    title: 'N5 - Basic Level',
    description: 'Cấp độ cơ bản nhất',
    keywords: ['n5', 'basic', 'co ban', 'beginner', '5'],
    category: 'content',
    icon: '🌱',
    path: '/level/n5',
    roles: null,
    priority: 90
  },
  {
    id: 'level-n4',
    title: 'N4 - Elementary Level',
    description: 'Cấp độ sơ cấp',
    keywords: ['n4', 'elementary', 'so cap', '4'],
    category: 'content',
    icon: '🌿',
    path: '/level/n4',
    roles: null,
    priority: 88
  },
  {
    id: 'level-n3',
    title: 'N3 - Intermediate Level',
    description: 'Cấp độ trung cấp',
    keywords: ['n3', 'intermediate', 'trung cap', '3'],
    category: 'content',
    icon: '🌳',
    path: '/level/n3',
    roles: null,
    priority: 86
  },
  {
    id: 'level-n2',
    title: 'N2 - Upper Intermediate',
    description: 'Cấp độ trung cao cấp',
    keywords: ['n2', 'upper intermediate', 'trung cao cap', '2'],
    category: 'content',
    icon: '🌲',
    path: '/level/n2',
    roles: null,
    priority: 84
  },
  {
    id: 'level-n1',
    title: 'N1 - Advanced Level',
    description: 'Cấp độ cao cấp',
    keywords: ['n1', 'advanced', 'cao cap', 'expert', '1'],
    category: 'content',
    icon: '🏔️',
    path: '/level/n1',
    roles: null,
    priority: 82
  },

  // ============================================
  // JLPT TESTS - Quick access
  // ============================================
  {
    id: 'jlpt-n5',
    title: 'JLPT N5 Test',
    description: 'Thi thử N5',
    keywords: ['jlpt n5', 'test n5', 'thi n5', 'exam n5'],
    category: 'content',
    icon: '📋',
    path: '/jlpt/n5',
    roles: null,
    priority: 85
  },
  {
    id: 'jlpt-n4',
    title: 'JLPT N4 Test',
    description: 'Thi thử N4',
    keywords: ['jlpt n4', 'test n4', 'thi n4', 'exam n4'],
    category: 'content',
    icon: '📋',
    path: '/jlpt/n4',
    roles: null,
    priority: 83
  },
  {
    id: 'jlpt-n3',
    title: 'JLPT N3 Test',
    description: 'Thi thử N3',
    keywords: ['jlpt n3', 'test n3', 'thi n3', 'exam n3'],
    category: 'content',
    icon: '📋',
    path: '/jlpt/n3',
    roles: null,
    priority: 81
  },
  {
    id: 'jlpt-n2',
    title: 'JLPT N2 Test',
    description: 'Thi thử N2',
    keywords: ['jlpt n2', 'test n2', 'thi n2', 'exam n2'],
    category: 'content',
    icon: '📋',
    path: '/jlpt/n2',
    roles: null,
    priority: 79
  },
  {
    id: 'jlpt-n1',
    title: 'JLPT N1 Test',
    description: 'Thi thử N1',
    keywords: ['jlpt n1', 'test n1', 'thi n1', 'exam n1'],
    category: 'content',
    icon: '📋',
    path: '/jlpt/n1',
    roles: null,
    priority: 77
  },

  // ============================================
  // ADMIN PAGES
  // ============================================
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    description: 'Trang quản trị chính',
    keywords: ['admin', 'dashboard', 'quan tri', 'control panel', 'a'],
    category: 'admin',
    icon: '⚙️',
    path: '/admin',
    roles: ['admin'],
    priority: 100
  },
  {
    id: 'admin-content',
    title: 'Content Management',
    description: 'Quản lý nội dung (Series, Books, Chapters, Lessons)',
    keywords: ['content', 'noi dung', 'management', 'quan ly', 'series', 'books', 'c', 'q'],
    category: 'admin',
    icon: '📚',
    path: '/admin/content',
    roles: ['admin'],
    priority: 95
  },
  {
    id: 'admin-quiz',
    title: 'Quiz Editor',
    description: 'Chỉnh sửa câu hỏi và bài tập',
    keywords: ['quiz', 'editor', 'cau hoi', 'questions', 'exercise', 'q', 'e'],
    category: 'admin',
    icon: '📝',
    path: '/admin/quiz-editor',
    roles: ['admin'],
    priority: 90
  },
  {
    id: 'admin-jlpt',
    title: 'JLPT Management',
    description: 'Quản lý đề thi JLPT',
    keywords: ['jlpt', 'exam', 'de thi', 'test management', 'j'],
    category: 'admin',
    icon: '📋',
    path: '/admin/jlpt',
    roles: ['admin'],
    priority: 85
  },
  {
    id: 'admin-users',
    title: 'User Management',
    description: 'Quản lý người dùng',
    keywords: ['user', 'nguoi dung', 'management', 'account', 'u'],
    category: 'admin',
    icon: '👥',
    path: '/admin/users',
    roles: ['admin'],
    priority: 80
  },
  {
    id: 'admin-settings',
    title: 'System Settings',
    description: 'Cài đặt hệ thống',
    keywords: ['settings', 'cai dat', 'system', 'config', 'configuration', 's', 'c'],
    category: 'admin',
    icon: '⚙️',
    path: '/admin/settings',
    roles: ['admin'],
    priority: 75
  },
  {
    id: 'admin-analytics',
    title: 'Analytics',
    description: 'Thống kê và phân tích',
    keywords: ['analytics', 'thong ke', 'statistics', 'phan tich', 'a', 't'],
    category: 'admin',
    icon: '📊',
    path: '/admin/analytics',
    roles: ['admin'],
    priority: 70
  },
  {
    id: 'admin-export',
    title: 'Export/Import',
    description: 'Xuất/Nhập dữ liệu',
    keywords: ['export', 'import', 'xuat', 'nhap', 'data', 'backup', 'e', 'i'],
    category: 'admin',
    icon: '💾',
    path: '/admin/export-import',
    roles: ['admin'],
    priority: 65
  },

  // ============================================
  // EDITOR PAGES
  // ============================================
  {
    id: 'editor-dashboard',
    title: 'Editor Dashboard',
    description: 'Trang biên tập viên',
    keywords: ['editor', 'bien tap', 'dashboard', 'e'],
    category: 'editor',
    icon: '✏️',
    path: '/editor',
    roles: ['editor', 'admin'],
    priority: 90
  },
  {
    id: 'editor-content',
    title: 'Edit Content',
    description: 'Chỉnh sửa nội dung bài học',
    keywords: ['edit', 'content', 'chinh sua', 'noi dung', 'lesson', 'e', 'c'],
    category: 'editor',
    icon: '📝',
    path: '/editor/content',
    roles: ['editor', 'admin'],
    priority: 85
  },

  // ============================================
  // AUTH PAGES
  // ============================================
  {
    id: 'auth-login',
    title: 'Login',
    description: 'Đăng nhập',
    keywords: ['login', 'dang nhap', 'signin', 'sign in', 'l'],
    category: 'page',
    icon: '🔐',
    path: '/login',
    roles: null,
    priority: 60
  },
  {
    id: 'auth-register',
    title: 'Register',
    description: 'Đăng ký tài khoản',
    keywords: ['register', 'dang ky', 'signup', 'sign up', 'r'],
    category: 'page',
    icon: '📝',
    path: '/register',
    roles: null,
    priority: 60
  }
];

/**
 * Get searchable items filtered by user role
 * @param {string|null} userRole - User's role (null = guest, 'user', 'editor', 'admin')
 * @returns {Array} Filtered searchable items
 */
export function getSearchableItemsByRole(userRole = null) {
  return SEARCHABLE_ITEMS.filter(item => {
    // Public items (roles: null)
    if (item.roles === null) return true;
    
    // Guest users can only see public items
    if (!userRole) return false;
    
    // Check if user's role is in allowed roles
    return item.roles.includes(userRole);
  });
}

/**
 * Calculate fuzzy match score between two strings
 * @param {string} str - String to search in
 * @param {string} query - Search query
 * @returns {number} Match score (0 = no match, higher = better match)
 */
function fuzzyMatch(str, query) {
  str = str.toLowerCase();
  query = query.toLowerCase();
  
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < str.length && queryIndex < query.length; i++) {
    if (str[i] === query[queryIndex]) {
      score += 1 + consecutiveMatches;
      consecutiveMatches++;
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
  }
  
  // Return 0 if not all query characters found
  if (queryIndex !== query.length) return 0;
  
  // Bonus for exact match
  if (str === query) score += 100;
  
  // Bonus for starting match
  if (str.startsWith(query)) score += 50;
  
  // Penalty for length difference
  score -= Math.abs(str.length - query.length) * 0.5;
  
  return Math.max(0, score);
}

/**
 * Remove Vietnamese diacritics for better search
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Search items by query with fuzzy matching
 * @param {string} query - Search query
 * @param {string|null} userRole - User's role
 * @returns {Array} Matched items sorted by relevance
 */
export function searchItems(query, userRole = null) {
  if (!query || query.length === 0) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedQueryNoDiacritics = removeDiacritics(normalizedQuery);
  const items = getSearchableItemsByRole(userRole);
  
  // Score each item based on match quality
  const scoredItems = items.map(item => {
    let score = 0;
    
    const titleLower = item.title.toLowerCase();
    const descriptionLower = item.description.toLowerCase();
    const titleNoDiacritics = removeDiacritics(titleLower);
    const descriptionNoDiacritics = removeDiacritics(descriptionLower);
    
    // Title exact match (highest priority)
    if (titleLower === normalizedQuery) {
      score += 1000;
    }
    // Title starts with query
    else if (titleLower.startsWith(normalizedQuery)) {
      score += 500;
    }
    // Title contains query
    else if (titleLower.includes(normalizedQuery)) {
      score += 200;
    }
    // Title fuzzy match
    else {
      const fuzzyScore = fuzzyMatch(titleLower, normalizedQuery);
      if (fuzzyScore > 0) {
        score += fuzzyScore * 10; // Scale up fuzzy score
      }
    }
    
    // Match without diacritics (for Vietnamese)
    if (titleNoDiacritics.includes(normalizedQueryNoDiacritics) && !titleLower.includes(normalizedQuery)) {
      score += 150;
    }
    
    // Description match
    if (descriptionLower.includes(normalizedQuery)) {
      score += 100;
    }
    // Description fuzzy match
    else {
      const descFuzzyScore = fuzzyMatch(descriptionLower, normalizedQuery);
      if (descFuzzyScore > 0) {
        score += descFuzzyScore * 5;
      }
    }
    
    // Keywords match (important for Vietnamese/shortcuts)
    for (const keyword of item.keywords) {
      const keywordLower = keyword.toLowerCase();
      const keywordNoDiacritics = removeDiacritics(keywordLower);
      
      // Exact keyword match
      if (keywordLower === normalizedQuery) {
        score += 400;
        break;
      }
      // Keyword contains query
      else if (keywordLower.includes(normalizedQuery)) {
        score += 300;
      }
      // Keyword without diacritics
      else if (keywordNoDiacritics.includes(normalizedQueryNoDiacritics)) {
        score += 250;
      }
      // Keyword fuzzy match
      else {
        const keywordFuzzyScore = fuzzyMatch(keywordLower, normalizedQuery);
        if (keywordFuzzyScore > 0) {
          score += keywordFuzzyScore * 8;
        }
      }
    }
    
    // Add priority bonus
    score += item.priority;
    
    return { ...item, score };
  });
  
  // Filter items with score > 0 and sort by score
  return scoredItems
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Get category label (i18n key)
 * @param {string} category - Category ID
 * @returns {object} Label info with i18n key
 */
export function getCategoryLabel(category) {
  const labels = {
    page: { labelKey: 'search.category.page', color: 'blue' },
    feature: { labelKey: 'search.category.feature', color: 'green' },
    content: { labelKey: 'search.category.content', color: 'purple' },
    admin: { labelKey: 'search.category.admin', color: 'red' },
    editor: { labelKey: 'search.category.editor', color: 'orange' }
  };
  
  return labels[category] || { labelKey: 'search.category.other', color: 'gray' };
}

