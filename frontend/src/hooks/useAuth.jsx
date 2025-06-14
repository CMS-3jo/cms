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
    const initAuth = async () => {
      // 기존 sessionStorage의 토큰들 정리 (한 번만 실행)
      if (sessionStorage.getItem('accessToken') || sessionStorage.getItem('userId')) {
        console.log('기존 sessionStorage 토큰들을 정리합니다...');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('role');
      }

      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Access Token이 있으면 사용자 정보 복원
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        setUser({ userId, role });
      } else {
        // Access Token이 없으면 Refresh Token으로 새로 발급 시도
        await tryRefreshToken();
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Refresh Token으로 새 Access Token 발급
  const tryRefreshToken = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // HttpOnly Cookie 전송
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Access Token과 사용자 정보는 localStorage에 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('role', data.role);
        
        setUser({ userId: data.userId, role: data.role });
        return true;
      }
    } catch (error) {
      console.log('Token refresh failed:', error);
    }
    return false;
  };

  // 로그인 함수
  const login = async (loginData) => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        credentials: 'include', // HttpOnly Cookie 수신
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
      
      // Access Token과 사용자 정보는 localStorage에 저장
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      
      // Refresh Token은 서버에서 HttpOnly Cookie로 자동 설정됨
      
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
  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (HttpOnly Cookie 삭제)
      await fetch('http://localhost:8082/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
    } catch (error) {
      console.log('Logout request failed:', error);
    }
    
    // 클라이언트 저장소 정리
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  // API 호출용 헬퍼 함수 (토큰 자동 갱신)
  const apiCall = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    
    // 첫 번째 시도
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // 401 에러면 토큰 갱신 후 재시도
    if (response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        accessToken = localStorage.getItem('accessToken');
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } else {
        // 토큰 갱신 실패 시 로그아웃
        logout();
        throw new Error('Authentication required');
      }
    }

    return response;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    apiCall, // 토큰 자동 갱신 기능 포함
    isLoggedIn: !!user,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};