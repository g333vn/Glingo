// src/contexts/AuthContext.jsx
// Context để quản lý authentication state toàn app

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginUser, register as registerUser } from '../data/users.js';
import { trackUserActivity } from '../utils/analyticsTracker.js';
import { getCurrentUser as getSupabaseUser, getUserProfile as getSupabaseUserProfile, signOut as supabaseSignOut } from '../services/authService.js';
import { fullSync } from '../services/dataSyncService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Hàm sync role từ adminUsers (Single Source of Truth)
  const syncUserFromAdminUsers = useCallback((currentUser) => {
    if (!currentUser) return null;
    
    try {
      const savedUsers = localStorage.getItem('adminUsers');
      if (!savedUsers) return currentUser;
      
      const allUsers = JSON.parse(savedUsers);
      const updatedUser = allUsers.find(
        u => u.id === currentUser.id || u.username === currentUser.username
      );
      
      if (!updatedUser) {
        // User đã bị xóa khỏi adminUsers → logout
        console.warn('[AUTH] User not found in adminUsers, logging out...');
        localStorage.removeItem('authUser');
        return null;
      }
      
      // Check nếu role hoặc thông tin khác đã thay đổi
      if (updatedUser.role !== currentUser.role || 
          updatedUser.name !== currentUser.name ||
          updatedUser.email !== currentUser.email) {
        
        console.log('[AUTH] User data changed, syncing:', {
          username: updatedUser.username,
          oldRole: currentUser.role,
          newRole: updatedUser.role,
          oldName: currentUser.name,
          newName: updatedUser.name
        });
        
        const syncedUser = {
          ...currentUser,
          role: updatedUser.role,
          name: updatedUser.name || currentUser.name,
          email: updatedUser.email || currentUser.email
        };
        
        // Update both state and localStorage
        setUser(syncedUser);
        try {
          localStorage.setItem('authUser', JSON.stringify(syncedUser));
        } catch (storageError) {
          // localStorage không available (incognito mode) → bỏ qua
          console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
        }
        return syncedUser;
      }
      
      return currentUser;
    } catch (error) {
      console.error('[AUTH] Error syncing user:', error);
      return currentUser;
    }
  }, []);

  // ✅ Listen for Supabase auth state changes
  useEffect(() => {
    let subscription = null;

    // Dynamic import để tránh circular dependency
    import('../services/supabaseClient.js').then(({ supabase }) => {
      if (!supabase) return;

      const authStateChange = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AUTH][Supabase] Auth state changed:', event, session?.user?.email || 'no user');

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // User đăng nhập hoặc token được refresh
          if (session?.user) {
            const { getUserProfile: getSupabaseUserProfile } = await import('../services/authService.js');
            const { success: profileOk, profile } = await getSupabaseUserProfile(session.user.id);

            const mappedUser = {
              id: session.user.id,
              username: session.user.email,
              name: profile?.display_name || session.user.email,
              email: session.user.email,
              role: profile?.role || 'user',
            };

            setUser(mappedUser);
            try {
              localStorage.setItem('authUser', JSON.stringify(mappedUser));
            } catch (storageError) {
              // localStorage không available (incognito mode) → bỏ qua
              console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
            }
            console.log('[AUTH][Supabase] User updated from auth state change');
          }
        } else if (event === 'SIGNED_OUT') {
          // User đăng xuất
          setUser(null);
          try {
            localStorage.removeItem('authUser');
          } catch (storageError) {
            // localStorage không available → bỏ qua
          }
          console.log('[AUTH][Supabase] User signed out');
        }
      });

      subscription = authStateChange.data.subscription;
    }).catch(err => {
      console.error('[AUTH] Error setting up Supabase auth listener:', err);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // ✅ Load user on mount (chỉ 1 lần)
  useEffect(() => {
    let isMounted = true;

    async function loadInitialUser() {
      try {
        // ✅ CRITICAL: Check Supabase session trước (nếu Supabase được config)
        // Vì Supabase session là source of truth cho Supabase users
        let supabaseUser = null;
        let supabaseSuccess = false;
        let supabaseError = null;
        
        // Kiểm tra xem Supabase có được config không
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          // Supabase được config → thử lấy user với timeout
          try {
            // ✅ Add timeout để tránh stuck (3 giây)
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Supabase getUser timeout')), 3000)
            );
            
            const result = await Promise.race([
              getSupabaseUser(),
              timeoutPromise
            ]);
            
            supabaseSuccess = result.success;
            supabaseUser = result.user;
            supabaseError = result.error;
          } catch (err) {
            // Supabase không available hoặc timeout → bỏ qua, fallback về localStorage
            supabaseError = err;
            console.log('[AUTH] Supabase error/timeout, falling back to localStorage:', err.message);
            // ✅ Không set supabaseSuccess = false ở đây vì có thể session vẫn còn
          }
        } else {
          // Supabase chưa được config → bỏ qua, dùng localStorage
          console.log('[AUTH] Supabase not configured, using localStorage only');
        }
        
        if (supabaseSuccess && supabaseUser && isMounted) {
          // Có Supabase session → đây là Supabase user
          console.log('[AUTH][Supabase] Session found on mount:', {
            id: supabaseUser.id,
            email: supabaseUser.email,
          });

          // Lấy profile (role, display_name)
          const { success: profileOk, profile } = await getSupabaseUserProfile(supabaseUser.id);

          const mappedUser = {
            id: supabaseUser.id,
            username: supabaseUser.email,
            name: profile?.display_name || supabaseUser.email,
            email: supabaseUser.email,
            role: profile?.role || 'user',
          };

          setUser(mappedUser);
          // Lưu vào authUser để các phần khác sử dụng chung format
          try {
            localStorage.setItem('authUser', JSON.stringify(mappedUser));
          } catch (storageError) {
            // localStorage không available (incognito mode hoặc disabled)
            console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
            // Vẫn tiếp tục, dùng Supabase session làm source of truth
          }

          // ✅ NEW: Auto sync Supabase user vào localStorage adminUsers
          if (typeof supabaseUser.id === 'string' && supabaseUser.id.length > 20) {
            // UUID format (Supabase user) - auto sync vào adminUsers
            import('../data/users.js').then(({ syncSupabaseUserToLocal }) => {
              syncSupabaseUserToLocal(supabaseUser, profile || null).then(result => {
                if (result.success) {
                  console.log('[AUTH] Auto-synced Supabase user to localStorage:', result.user.email);
                } else {
                  console.warn('[AUTH] Failed to auto-sync user:', result.error);
                }
              });
            }).catch(err => {
              console.error('[AUTH] Error importing sync function:', err);
            });
          }

          // ✅ NEW: Auto sync data khi user đăng nhập với Supabase account
          if (typeof mappedUser.id === 'string' && mappedUser.id.length > 20) {
            // UUID format (Supabase user)
            fullSync(mappedUser.id).catch(err => {
              console.error('[AUTH] Error syncing data:', err);
            });
          }
          
          // ✅ CRITICAL: Set isLoading = false và return ngay
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        // ✅ Nếu không có Supabase session → check localStorage (cho local users)
        let savedUser = null;
        try {
          savedUser = localStorage.getItem('authUser');
        } catch (storageError) {
          // localStorage không available (incognito mode hoặc disabled)
          console.warn('[AUTH] Cannot read from localStorage (incognito mode?):', storageError.message);
          // Tiếp tục với Supabase session hoặc no user
        }
        
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            
            // ✅ CRITICAL: Nếu là Supabase user (UUID) nhưng không có session
            if (typeof parsedUser.id === 'string' && parsedUser.id.length > 20) {
              // Kiểm tra xem Supabase có được config không
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
              
              if (supabaseUrl && supabaseKey) {
                // Supabase được config
                // ✅ CHỈ logout nếu error rõ ràng là session expired
                // Nếu timeout hoặc network error → giữ user và để auth state listener xử lý
                if (supabaseError && !supabaseSuccess) {
                  const errorMsg = (supabaseError.message || '').toLowerCase();
                  // Chỉ logout nếu error rõ ràng về session/token expired (không phải timeout)
                  if (!errorMsg.includes('timeout') && 
                      (errorMsg.includes('session') || errorMsg.includes('token') || 
                       errorMsg.includes('expired') || errorMsg.includes('invalid'))) {
                    console.warn('[AUTH] Supabase session expired, logging out...');
                    try {
                      localStorage.removeItem('authUser');
                    } catch (storageError) {
                      // localStorage không available → bỏ qua
                    }
                    if (isMounted) {
                      setUser(null);
                      setIsLoading(false);
                    }
                    return;
                  }
                  // Nếu là timeout hoặc network error → giữ user (có thể session vẫn còn)
                  // Auth state listener sẽ xử lý sau
                  console.log('[AUTH] Supabase user in localStorage, keeping (timeout/network error, will let auth listener handle)');
                } else {
                  // Không có error hoặc đã có session → giữ user
                  console.log('[AUTH] Supabase user in localStorage, keeping (no error or session exists)');
                }
              } else {
                // Supabase chưa được config → giữ user trong localStorage (fallback)
                console.log('[AUTH] Supabase not configured, keeping Supabase user in localStorage as fallback');
              }
            }
            
            // ✅ Load user từ localStorage (có thể là Supabase user hoặc local user)
            console.log('[AUTH] User loaded from authUser:', { id: parsedUser.id, username: parsedUser.username, role: parsedUser.role });
            
            // ✅ Nếu là Supabase user, không sync từ adminUsers (vì Supabase là source of truth)
            // Chỉ sync nếu là local user
            let syncedUser = parsedUser;
            if (typeof parsedUser.id !== 'string' || parsedUser.id.length <= 20) {
              // Local user (numeric ID) → sync từ adminUsers
              syncedUser = syncUserFromAdminUsers(parsedUser);
            }
            
            if (isMounted) {
              setUser(syncedUser);
              setIsLoading(false);
            }
            return;
          } catch (error) {
            console.error('[AUTH] Error loading user from authUser:', error);
            try {
              localStorage.removeItem('authUser');
            } catch (storageError) {
              // localStorage không available → bỏ qua
            }
          }
        }

        // ✅ Không có user nào → logout state
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[AUTH] Error in loadInitialUser:', error);
        // ✅ CRITICAL: Luôn set isLoading = false để tránh stuck
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } finally {
        // ✅ CRITICAL: Đảm bảo isLoading luôn được set về false
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialUser();

    return () => {
      isMounted = false;
    };
  }, [syncUserFromAdminUsers]);

  // ✅ Listen for localStorage changes từ other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // adminUsers thay đổi → sync role
      if (e.key === 'adminUsers' && user) {
        console.log('[AUTH] adminUsers changed (other tab), syncing...');
        syncUserFromAdminUsers(user);
      }
      
      // authUser bị xóa → logout
      if (e.key === 'authUser' && e.newValue === null && user) {
        console.log('[AUTH] authUser removed (other tab), logging out...');
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, syncUserFromAdminUsers]);

  // ✅ CRITICAL: Listen for adminUsers changes trong CÙNG TAB
  // storage event không fire trong cùng tab, phải dùng custom event
  useEffect(() => {
    const handleAdminUsersUpdate = () => {
      if (user) {
        console.log('[AUTH] adminUsers updated (same tab), syncing...');
        syncUserFromAdminUsers(user);
      }
    };

    window.addEventListener('adminUsersUpdated', handleAdminUsersUpdate);
    return () => window.removeEventListener('adminUsersUpdated', handleAdminUsersUpdate);
  }, [user, syncUserFromAdminUsers]);

  // ✅ Backup: Periodic sync mỗi 10 giây (fallback)
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      syncUserFromAdminUsers(user);
    }, 10000); // 10 giây
    
    return () => clearInterval(intervalId);
  }, [user, syncUserFromAdminUsers]);

  // Login function
  const login = (username, password) => {
    const result = loginUser(username, password);
    if (result.success) {
      // ✅ FIX: Đảm bảo role được load đúng từ getUsers()
      // result.user đã có role mới từ getUsers() nên không cần sync thêm
      setUser(result.user);
      try {
        localStorage.setItem('authUser', JSON.stringify(result.user));
      } catch (storageError) {
        // localStorage không available (incognito mode) → bỏ qua
        console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
      }
      
      // 📊 Track login activity
      trackUserActivity(result.user.id, result.user.username, 'login', {
        role: result.user.role,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  };

  // Register function
  const register = (userData) => {
    const result = registerUser(userData);
    if (result.success) {
      // Auto login after successful registration
      setUser(result.user);
      try {
        localStorage.setItem('authUser', JSON.stringify(result.user));
      } catch (storageError) {
        // localStorage không available (incognito mode) → bỏ qua
        console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
      }
      
      // 📊 Track registration activity
      trackUserActivity(result.user.id, result.user.username, 'register', {
        role: result.user.role,
        email: result.user.email,
        timestamp: new Date().toISOString()
      });
      
      return { success: true, user: result.user };
    }
    return { success: false, error: result.error };
  };

  // Update user function
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    try {
      localStorage.setItem('authUser', JSON.stringify(updatedUserData));
    } catch (storageError) {
      // localStorage không available (incognito mode) → bỏ qua
      console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
    }
  };

  // Logout function
  const logout = async () => {
    // 📊 Track logout activity before clearing user
    if (user) {
      trackUserActivity(user.id, user.username, 'logout', {
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // Nếu user hiện tại là tài khoản Supabase (id là UUID string) → gọi signOut để xóa session trên backend
      try {
        if (typeof user.id === 'string') {
          await supabaseSignOut();
          console.log('[AUTH][Supabase] signOut called successfully');
        }
      } catch (err) {
        console.error('[AUTH][Supabase] Error during signOut:', err);
      }
    }
    
    setUser(null);
    try {
      localStorage.removeItem('authUser');
    } catch (storageError) {
      // localStorage không available → bỏ qua
    }
    // ✅ CRITICAL: KHÔNG xóa adminUsers và userPasswords khi logout
    // Vì đây là dữ liệu của tất cả users trong hệ thống, không phải chỉ của user đang logout
    // Nếu xóa, tất cả users mới được tạo sẽ bị mất!
    // localStorage.removeItem('adminUsers'); // ❌ KHÔNG XÓA
    // localStorage.removeItem('userPasswords'); // ❌ KHÔNG XÓA
    
    console.log('[AUTH] Logout successful, authUser removed but adminUsers/userPasswords preserved');
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!user) return false;
    const { roles } = require('../data/users.js');
    const userRole = roles[user.role];
    if (!userRole) return false;
    return userRole.permissions.includes(permission);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    isAdmin,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook để sử dụng auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

