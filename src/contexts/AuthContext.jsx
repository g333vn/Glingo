// src/contexts/AuthContext.jsx
// Context để quản lý authentication state toàn app
// ✅ FIXED: Logout ngay lập tức, không bị loading vô tận, restore session ổn định

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

  // ✅ FIXED: Listen for Supabase auth state changes - ĐƠN GIẢN HÓA
  useEffect(() => {
    let subscription = null;

    // Dynamic import để tránh circular dependency
    import('../services/supabaseClient.js').then(({ supabase }) => {
      if (!supabase) return;

      const authStateChange = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AUTH][Supabase] Auth state changed:', event, session?.user?.email || 'no user');

        if (event === 'INITIAL_SESSION') {
          // ✅ INITIAL_SESSION: Restore user từ session khi page load/reload
          if (session?.user) {
            console.log('[AUTH][Supabase] Initial session found on reload');
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
              console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
            }
            setIsLoading(false);
            console.log('[AUTH][Supabase] User restored from initial session');
          } else {
            // Không có session trong INITIAL_SESSION
            console.log('[AUTH][Supabase] No initial session found');
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // ✅ User đăng nhập hoặc token được refresh
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
              console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
            }
            // ✅ CRITICAL: Set isLoading = false khi đăng nhập thành công
            setIsLoading(false);
            console.log('[AUTH][Supabase] User updated from auth state change');
          }
        } else if (event === 'SIGNED_OUT') {
          // ✅ FIXED: Logout NGAY LẬP TỨC - Không delay, không verify
          console.log('[AUTH][Supabase] SIGNED_OUT event received, logging out immediately...');
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
      // ✅ CRITICAL: Set isLoading = false nếu có lỗi
      setIsLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // ✅ FIXED: Load user on mount - ĐƠN GIẢN HÓA
  useEffect(() => {
    let isMounted = true;

    async function loadInitialUser() {
      try {
        // ✅ FIXED: Giảm delay xuống 500ms để tăng tốc độ load
        // Auth listener sẽ handle INITIAL_SESSION, đây chỉ là fallback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ✅ Check Supabase session trước (nếu Supabase được config)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          // Supabase được config → check session
          try {
            const { supabase } = await import('../services/supabaseClient.js');
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user && isMounted) {
              // Có session → lấy profile
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
                console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
              }

              // ✅ Auto sync Supabase user vào localStorage adminUsers
              if (typeof session.user.id === 'string' && session.user.id.length > 20) {
                import('../data/users.js').then(({ syncSupabaseUserToLocal }) => {
                  syncSupabaseUserToLocal(session.user, profile || null).then(result => {
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

              // ✅ Auto sync data khi user đăng nhập với Supabase account
              if (typeof mappedUser.id === 'string' && mappedUser.id.length > 20) {
                fullSync(mappedUser.id).catch(err => {
                  console.error('[AUTH] Error syncing data:', err);
                });
              }
              
              if (isMounted) {
                setIsLoading(false);
              }
              return;
            }
          } catch (err) {
            console.log('[AUTH] Error checking Supabase session:', err.message);
          }
        }

        // ✅ Không có Supabase session → check localStorage (cho local users)
        let savedUser = null;
        try {
          savedUser = localStorage.getItem('authUser');
        } catch (storageError) {
          console.warn('[AUTH] Cannot read from localStorage (incognito mode?):', storageError.message);
        }
        
        if (savedUser && isMounted) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('[AUTH] User loaded from authUser:', { id: parsedUser.id, username: parsedUser.username, role: parsedUser.role });
            
            // Sync user nếu là local user (numeric ID)
            let syncedUser = parsedUser;
            if (typeof parsedUser.id !== 'string' || parsedUser.id.length <= 20) {
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
      if (e.key === 'adminUsers' && user) {
        console.log('[AUTH] adminUsers changed (other tab), syncing...');
        syncUserFromAdminUsers(user);
      }
      
      if (e.key === 'authUser' && e.newValue === null && user) {
        console.log('[AUTH] authUser removed (other tab), logging out...');
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, syncUserFromAdminUsers]);

  // ✅ Listen for adminUsers changes trong CÙNG TAB
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
      setUser(result.user);
      try {
        localStorage.setItem('authUser', JSON.stringify(result.user));
      } catch (storageError) {
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
      setUser(result.user);
      try {
        localStorage.setItem('authUser', JSON.stringify(result.user));
      } catch (storageError) {
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
      console.warn('[AUTH] Cannot save to localStorage (incognito mode?):', storageError.message);
    }
  };

  // ✅ FIXED: Logout function - Đơn giản hóa, logout ngay lập tức
  const logout = async () => {
    // 📊 Track logout activity before clearing user
    if (user) {
      trackUserActivity(user.id, user.username, 'logout', {
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // ✅ FIXED: Nếu user hiện tại là tài khoản Supabase → gọi signOut
      try {
        if (typeof user.id === 'string' && user.id.length > 20) {
          console.log('[AUTH] Signing out Supabase user...');
          await supabaseSignOut();
          console.log('[AUTH][Supabase] signOut called successfully');
          // ✅ CRITICAL: Sau khi signOut, SIGNED_OUT event sẽ fire và xử lý logout
          // Không cần set user = null ở đây nữa, để event listener xử lý
          return;
        }
      } catch (err) {
        console.error('[AUTH][Supabase] Error during signOut:', err);
      }
    }
    
    // ✅ FIXED: Nếu là local user hoặc lỗi khi signOut → logout trực tiếp
    setUser(null);
    try {
      localStorage.removeItem('authUser');
    } catch (storageError) {
      // localStorage không available → bỏ qua
    }
    
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