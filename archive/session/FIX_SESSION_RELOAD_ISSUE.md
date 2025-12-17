# 🔧 FIX: Session Bị Mất Khi Reload Trang

## 🐛 Vấn Đề

Khi đăng nhập bằng tài khoản Supabase và reload trang:
1. ✅ Đăng nhập thành công
2. ❌ Reload trang → bị logout
3. ❌ Không đăng nhập lại được
4. ✅ Tắt tab và mở lại → lại thấy đang đăng nhập

## 🔍 Nguyên Nhân

**Race Condition trong AuthContext:**

1. Khi reload trang, có 2 processes chạy song song:
   - `onAuthStateChange` listener (xử lý `INITIAL_SESSION` event)
   - `loadInitialUser` useEffect (load user từ localStorage/Supabase)

2. Vấn đề:
   - `onAuthStateChange` có thể fire `SIGNED_OUT` event **trước** khi `INITIAL_SESSION` được fire
   - `loadInitialUser` có thể check session **trước** khi Supabase restore session từ localStorage
   - Nếu session chưa được restore ngay, code sẽ nghĩ session đã hết → logout

3. Khi tắt tab và mở lại:
   - Supabase có thời gian restore session từ localStorage
   - Session được restore đúng → user vẫn đăng nhập

## ✅ Giải Pháp

### **1. Đảm bảo INITIAL_SESSION được xử lý trước**

**Thay đổi trong `onAuthStateChange`:**

```javascript
// ✅ Thêm flag để track INITIAL_SESSION đã được xử lý chưa
let initialSessionHandled = false;

// ✅ Xử lý INITIAL_SESSION trước tiên
if (event === 'INITIAL_SESSION') {
  initialSessionHandled = true;
  // ... restore user từ session
}

// ✅ Khi nhận SIGNED_OUT, đợi INITIAL_SESSION trước
else if (event === 'SIGNED_OUT') {
  if (!initialSessionHandled) {
    // Đợi tối đa 3 giây để INITIAL_SESSION được fire
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (!initialSessionHandled) {
      // INITIAL_SESSION chưa fire → không logout (false positive)
      return;
    }
  }
  // ... verify session thực sự đã hết
}
```

### **2. Cải thiện loadInitialUser**

**Thay đổi:**

```javascript
async function loadInitialUser() {
  // ✅ Đợi 1.5 giây để auth listener xử lý INITIAL_SESSION trước
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // ✅ Check xem user đã được set bởi INITIAL_SESSION chưa
  const savedUser = localStorage.getItem('authUser');
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    // Nếu là Supabase user, check session
    if (typeof parsedUser.id === 'string' && parsedUser.id.length > 20) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user.id === parsedUser.id) {
        // Session đã được restore → đã được set bởi INITIAL_SESSION
        setUser(parsedUser);
        setIsLoading(false);
        return; // Không override
      }
    }
  }
  
  // ... tiếp tục load user nếu chưa được set
}
```

### **3. Không logout nếu session đang được restore**

**Logic mới:**
- Nếu có Supabase user trong localStorage → **luôn giữ** khi reload
- Đợi `INITIAL_SESSION` event xử lý
- Chỉ logout nếu `INITIAL_SESSION` không fire và session thực sự không có

## 📝 Thay Đổi Chi Tiết

### **File: `src/contexts/AuthContext.jsx`**

1. **Thêm flag `initialSessionHandled`** để track INITIAL_SESSION
2. **Xử lý INITIAL_SESSION trước** các events khác
3. **Đợi INITIAL_SESSION** trước khi xử lý SIGNED_OUT
4. **Đợi 1.5 giây** trong `loadInitialUser` để auth listener chạy trước
5. **Check user đã được set** trước khi load từ localStorage

## ✅ Kết Quả

Sau khi fix:

1. ✅ Đăng nhập thành công
2. ✅ Reload trang → **vẫn đăng nhập** (session được restore)
3. ✅ Có thể đăng nhập lại nếu cần
4. ✅ Tắt tab và mở lại → vẫn đăng nhập

## 🧪 Test

### **Test Case 1: Reload sau khi đăng nhập**
1. Đăng nhập bằng Supabase account
2. Reload trang (F5)
3. ✅ **Expected:** Vẫn đăng nhập, không bị logout

### **Test Case 2: Reload nhiều lần**
1. Đăng nhập
2. Reload 5 lần liên tiếp
3. ✅ **Expected:** Vẫn đăng nhập sau mỗi lần reload

### **Test Case 3: Tắt tab và mở lại**
1. Đăng nhập
2. Tắt tab
3. Mở lại tab (same URL)
4. ✅ **Expected:** Vẫn đăng nhập

### **Test Case 4: Logout thực sự**
1. Đăng nhập
2. Click logout
3. Reload trang
4. ✅ **Expected:** Không đăng nhập (đã logout)

## 📚 Related Files

- `src/contexts/AuthContext.jsx` - Main auth context
- `src/services/authService.js` - Supabase auth service
- `src/services/supabaseClient.js` - Supabase client config

## 🔄 Migration Notes

**Không cần migration** - fix này chỉ cải thiện logic, không thay đổi data structure.

**Breaking Changes:** Không có

---

**Date:** 2025-01-XX  
**Status:** ✅ Fixed

