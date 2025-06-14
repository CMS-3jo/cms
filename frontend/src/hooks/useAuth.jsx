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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 페이지 로드 시 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 간단하게 토큰이 있으면 로그인 상태로 처리
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      setUser({ userId, role });
    }
    setLoading(false);
  }, []);

  // 로그인 함수
  const login = async (loginData) => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '로그인에 실패했습니다.');
      }

      const data = await response.json();
      
      // 토큰과 사용자 정보 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      
      // 사용자 정보 설정
      setUser({
        userId: data.userId,
        role: data.role
      });
      
      return data;
    } catch (error) {
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isLoggedIn: !!user,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};