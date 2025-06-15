import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// JWT 토큰 디코딩 함수
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    return null;
  }
};

// 토큰 만료 확인 함수
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 토큰에서 사용자 정보 추출하여 상태 업데이트
  const updateUserFromToken = (token) => {
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({
        userId: decoded.sub,            // USER_ID (로그인 ID)
        role: decoded.role,             // 권한
        name: decoded.name || 'Unknown', // 이름
        identifierNo: decoded.idNo || '' // 학번/사번
      });
    } else {
      setUser(null);
    }
  };

  // 페이지 로드 시 토큰 확인
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken && !isTokenExpired(accessToken)) {
        // 토큰이 유효하면 토큰에서 사용자 정보 추출
        updateUserFromToken(accessToken);
      } else {
        // 토큰이 없거나 만료되었으면 refresh 시도
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          // refresh도 실패하면 로그아웃 처리
          localStorage.removeItem('accessToken');
          setUser(null);
        }
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
        
        // Access Token만 localStorage에 저장
        localStorage.setItem('accessToken', data.accessToken);
        
        // 토큰에서 사용자 정보 추출하여 상태 업데이트
        updateUserFromToken(data.accessToken);
        
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
      
      // Access Token만 localStorage에 저장
      localStorage.setItem('accessToken', data.accessToken);
      
      // 토큰에서 사용자 정보 추출하여 상태 업데이트
      updateUserFromToken(data.accessToken);
      
      // Refresh Token은 서버에서 HttpOnly Cookie로 자동 설정됨
      
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
    setUser(null);
  };

  // API 호출용 헬퍼 함수 (토큰 자동 갱신)
  const apiCall = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    
    // 토큰이 만료되었으면 refresh 시도
    if (!accessToken || isTokenExpired(accessToken)) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) {
        logout();
        throw new Error('Authentication required');
      }
      accessToken = localStorage.getItem('accessToken');
    }
    
    // 첫 번째 시도
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // 401 에러면 토큰 갱신 후 재시도 (서버에서 토큰이 무효하다고 판단)
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