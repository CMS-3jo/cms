import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 쿠키에서 값을 읽는 헬퍼 함수 (토큰 확인용)
const getCookieValue = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
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
        userId: decoded.sub,
        role: decoded.role,
        name: decoded.name || 'Unknown',
        identifierNo: decoded.idNo || ''
      });
    } else {
      setUser(null);
    }
  };

  // 페이지 로드 시 토큰 확인 (localStorage 우선)
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken && !isTokenExpired(accessToken)) {
        updateUserFromToken(accessToken);
      } else {
        // localStorage에 없으면 쿠키에서 확인 후 localStorage로 복사
        const cookieToken = getCookieValue('accessToken');
        if (cookieToken && !isTokenExpired(cookieToken)) {
          localStorage.setItem('accessToken', cookieToken);
          updateUserFromToken(cookieToken);
        } else {
          // 둘 다 없으면 refresh 시도
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            setUser(null);
          }
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Access Token을 localStorage에 저장
        localStorage.setItem('accessToken', data.accessToken);
        updateUserFromToken(data.accessToken);
        return true;
      }
    } catch (error) {
      console.log('Token refresh failed:', error);
    }
    return false;
  };

  // 일반 로그인 함수
  const login = async (loginData) => {
    try {
      const response = await fetch('http://localhost:8082/api/auth/login', {
        method: 'POST',
        credentials: 'include',
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
      
      // Access Token을 localStorage에 저장
      localStorage.setItem('accessToken', data.accessToken);
      updateUserFromToken(data.accessToken);
      
      return data;
    } catch (error) {
      throw new Error(error.message || '로그인에 실패했습니다.');
    }
  };

  // 통합 OAuth 로그인 함수
  const oauthLogin = async (provider) => {
    try {
      console.log(`${provider} OAuth 로그인 시작`);
      
      const response = await fetch(`http://localhost:8082/api/auth/oauth/${provider}/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log(`${provider} OAuth URL 응답 상태:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${provider} OAuth URL 요청 실패:`, response.status, errorText);
        throw new Error(`OAuth URL 요청 실패: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error(`${provider} 예상과 다른 응답 타입:`, contentType, responseText);
        throw new Error(`서버에서 잘못된 응답을 받았습니다. Content-Type: ${contentType}`);
      }

      const urlData = await response.json();
      console.log(`${provider} OAuth URL 데이터:`, urlData);

      if (!urlData.authUrl) {
        throw new Error('OAuth URL이 응답에 포함되지 않았습니다');
      }

      // 팝업으로 OAuth 페이지 열기
      const popup = window.open(
        urlData.authUrl,
        'oauth_popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해 주세요.');
      }

      return new Promise((resolve, reject) => {
        let messageReceived = false;
        let checkCount = 0;
        const maxChecks = 300;
        let intervalId = null;
        
        let cleanup = null;
        let handlePopupClosed = null;
        let handleTimeout = null;
        
        const messageHandler = (event) => {
          if (event.origin !== window.location.origin) {
            console.warn('잘못된 origin에서 메시지:', event.origin);
            return;
          }
          
          if (event.data.type === 'OAUTH_SUCCESS') {
            messageReceived = true;
            cleanup();
            
            // 소셜 로그인 성공 시 쿠키에서 토큰을 읽어서 localStorage로 복사
            setTimeout(() => {
              const cookieToken = getCookieValue('accessToken');
              if (cookieToken && !isTokenExpired(cookieToken)) {
                localStorage.setItem('accessToken', cookieToken);
                updateUserFromToken(cookieToken);
                console.log('소셜 로그인 토큰을 localStorage로 복사 완료');
              }
            }, 500);
            
            resolve(event.data);
          } else if (event.data.type === 'OAUTH_ERROR') {
            messageReceived = true;
            cleanup();
            reject(new Error(event.data.error));
          }
        };

        cleanup = () => {
          window.removeEventListener('message', messageHandler);
          if (intervalId) {
            clearInterval(intervalId);
          }
          try {
            if (popup && !popup.closed) {
              popup.close();
            }
          } catch (error) {
            console.warn('팝업 닫기 실패:', error);
          }
        };

        handlePopupClosed = () => {
          if (messageReceived) return;
          
          cleanup();
          
          // 팝업이 닫혔을 때 토큰 확인
          setTimeout(() => {
            const cookieToken = getCookieValue('accessToken');
            if (cookieToken && !isTokenExpired(cookieToken)) {
              localStorage.setItem('accessToken', cookieToken);
              updateUserFromToken(cookieToken);
              resolve({ success: true });
            } else {
              reject(new Error('소셜 로그인이 취소되었습니다'));
            }
          }, 1000);
        };
        
        handleTimeout = () => {
          if (messageReceived) return;
          cleanup();
          reject(new Error('로그인 시간이 초과되었습니다'));
        };

        window.addEventListener('message', messageHandler);

        intervalId = setInterval(() => {
          checkCount++;
          
          try {
            if (popup.closed) {
              handlePopupClosed();
              return;
            }
          } catch (error) {
            console.warn('popup.closed 접근 실패:', error);
            // COOP 에러 시에도 토큰 체크
            const cookieToken = getCookieValue('accessToken');
            if (cookieToken && !isTokenExpired(cookieToken)) {
              messageReceived = true;
              cleanup();
              localStorage.setItem('accessToken', cookieToken);
              updateUserFromToken(cookieToken);
              resolve({ success: true });
              return;
            }
          }
          
          if (checkCount >= maxChecks) {
            handleTimeout();
            return;
          }
        }, 1000);
      });

    } catch (error) {
      console.error(`${provider} 로그인 실패:`, error);
      throw error;
    }
  };

  // 개별 소셜 로그인 함수들
  const googleLogin = async () => {
    return await oauthLogin('google');
  };

  const kakaoLogin = async () => {
    return await oauthLogin('kakao');
  };

  const naverLogin = async () => {
    return await oauthLogin('naver');
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      await fetch('http://localhost:8082/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.log('Logout request failed:', error);
    }
    
    // localStorage 정리
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  // API 호출용 헬퍼 함수
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
      credentials: 'include',
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
          credentials: 'include',
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } else {
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
    oauthLogin,
    googleLogin,
    kakaoLogin,
    naverLogin,
    logout,
    apiCall,
    isLoggedIn: !!user,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};