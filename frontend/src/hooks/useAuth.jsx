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
  const [loading, setLoading] = useState(true); // 초기 로딩 상태

  useEffect(() => {
    // 페이지 로드 시 저장된 로그인 상태 확인
    const checkAuthStatus = () => {
      try {
        const savedLoginState = localStorage.getItem('isLoggedIn');
        const savedUser = localStorage.getItem('user');
        
        if (savedLoginState === 'true' && savedUser) {
          // 로그인 상태가 저장되어 있으면 복원
          setIsLoggedIn(true);
          setUser(JSON.parse(savedUser));
          console.log('로그인 상태 복원됨');
        } else {
          // 저장된 로그인 상태가 없으면 로그아웃 상태 유지
          setIsLoggedIn(false);
          setUser(null);
          console.log('로그아웃 상태 유지');
        }
      } catch (error) {
        // 오류 발생 시 로그아웃 상태로 설정
        console.error('인증 상태 확인 중 오류:', error);
        setIsLoggedIn(false);
        setUser(null);
        // 손상된 데이터 제거
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    // 즉시 실행 (딜레이 없음)
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('로그인 시도:', credentials);
      
      // 임시 로그인 로직 (실제로는 API 호출)
      const userData = { 
        name: '관리자', 
        email: 'admin@example.com',
        id: credentials.userId || 'admin'
      };
      
      // 상태 업데이트
      setUser(userData);
      setIsLoggedIn(true);
      
      // 로컬 스토리지에 로그인 상태 저장
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('로그인 성공');
      return { success: true };
      
    } catch (error) {
      console.error('로그인 오류:', error);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  };

  const logout = () => {
    console.log('로그아웃 실행');
    
    // 상태 초기화
    setUser(null);
    setIsLoggedIn(false);
    
    // 로컬 스토리지에서 로그인 정보 제거
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    console.log('로그아웃 완료 - 로그아웃 상태로 변경됨');
  };

  const checkAuthStatus = async () => {
    // 실제 API로 토큰 검증하는 경우 여기서 구현
    // 현재는 로컬 스토리지 기반으로만 동작
    const savedLoginState = localStorage.getItem('isLoggedIn');
    return savedLoginState === 'true';
  };

  // 강제 로그아웃 (에러 발생 시 등)
  const forceLogout = () => {
    console.log('강제 로그아웃 실행');
    logout();
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    forceLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};