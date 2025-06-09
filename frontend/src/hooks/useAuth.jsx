// src/hooks/useAuth.jsx
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 초기 로그인 상태 확인 (임시로 false로 설정)
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(false);
      setLoading(false);
    }, 500);
  }, []);

  const login = async (credentials) => {
    try {
      // 임시 로그인 로직
      setUser({ name: '관리자', email: 'admin@example.com' });
      setIsLoggedIn(true);
      return { success: true };
      
      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('authToken', token);
        setUser(user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
      */
    } catch (error) {
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    // localStorage.removeItem('authToken'); // 실제 구현시 사용
  };

  const checkAuthStatus = async () => {
    // 임시로 아무것도 하지 않음
    return;
    
    // 실제 API 호출 코드 (주석 처리)
    /*
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    */
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};