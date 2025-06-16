import React, { useEffect, useState } from 'react';

const OAuthCallback = () => {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    // URL 파라미터 파싱
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    console.log('OAuth 콜백 페이지 로드:', { success, error });

    const handleCallback = async () => {
      try {
        if (success === 'true') {
          setStatus('success');
          setMessage('로그인 성공! 창을 닫는 중...');
          
          // 성공 시 부모 창에 메시지 전송
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                success: true,
                timestamp: Date.now()
              }, window.location.origin);
              
              console.log('OAuth 성공 메시지 전송됨');
              
              // 메시지 전송 후 잠시 대기 후 창 닫기
              setTimeout(() => {
                window.close();
              }, 1000);
              
            } catch (postMessageError) {
              console.error('PostMessage 실패:', postMessageError);
              // postMessage 실패 시 리다이렉트
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          } else {
            console.warn('부모 창을 찾을 수 없습니다. 메인 페이지로 이동합니다.');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          }
          
        } else if (success === 'false') {
          setStatus('error');
          const errorMessage = error || '소셜 로그인에 실패했습니다';
          setMessage(`로그인 실패: ${errorMessage}`);
          
          // 실패 시 부모 창에 에러 메시지 전송
          if (window.opener && !window.opener.closed) {
            try {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: errorMessage,
                timestamp: Date.now()
              }, window.location.origin);
              
              console.log('OAuth 에러 메시지 전송됨');
              
              setTimeout(() => {
                window.close();
              }, 3000);
              
            } catch (postMessageError) {
              console.error('PostMessage 실패:', postMessageError);
              setTimeout(() => {
                window.location.href = '/?error=' + encodeURIComponent(errorMessage);
              }, 3000);
            }
          } else {
            console.warn('부모 창을 찾을 수 없습니다');
            setTimeout(() => {
              window.location.href = '/?error=' + encodeURIComponent(errorMessage);
            }, 3000);
          }
          
        } else {
          // success 파라미터가 없는 경우 - 서버에서 처리 중
          setMessage('서버에서 로그인을 처리하고 있습니다...');
          
          // 3초 후에도 파라미터가 없으면 에러로 처리
          setTimeout(() => {
            const newParams = new URLSearchParams(window.location.search);
            if (!newParams.get('success')) {
              setStatus('error');
              setMessage('로그인 처리 시간이 초과되었습니다');
              
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                  type: 'OAUTH_ERROR',
                  error: '로그인 처리 시간 초과'
                }, window.location.origin);
                
                setTimeout(() => window.close(), 2000);
              } else {
                setTimeout(() => {
                  window.location.href = '/?error=timeout';
                }, 2000);
              }
            }
          }, 3000);
        }
        
      } catch (err) {
        console.error('콜백 처리 중 오류:', err);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다');
        
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: '콜백 처리 오류: ' + err.message
            }, window.location.origin);
          } catch (e) {
            console.error('에러 메시지 전송 실패:', e);
          }
        }
        
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            window.location.href = '/?error=callback_error';
          }
        }, 3000);
      }
    };

    // 콜백 처리 시작
    handleCallback();

    // cleanup 함수 - 컴포넌트 언마운트 시 실행
    return () => {
      console.log('OAuth 콜백 컴포넌트 정리');
    };
  }, []);

  // 상태별 아이콘과 색상
  const getStatusDisplay = () => {
    switch (status) {
      case 'success':
        return {
          icon: '✅',
          colorClass: 'text-success',
          bgClass: 'bg-success-subtle'
        };
      case 'error':
        return {
          icon: '❌',
          colorClass: 'text-danger',
          bgClass: 'bg-danger-subtle'
        };
      default:
        return {
          icon: '🔄',
          colorClass: 'text-primary',
          bgClass: 'bg-primary-subtle'
        };
    }
  };

  const { icon, colorClass, bgClass } = getStatusDisplay();

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className={`card-body p-4 text-center ${bgClass}`}>
          {/* 상태 아이콘 */}
          <div className="mb-3">
            <span style={{ fontSize: '3rem' }}>{icon}</span>
          </div>
          
          {/* 로딩 스피너 (처리 중일 때만) */}
          {status === 'processing' && (
            <div className="mb-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {/* 메시지 */}
          <h5 className={`card-title ${colorClass} mb-3`}>
            {status === 'success' ? '로그인 성공!' : 
             status === 'error' ? '로그인 실패' : 
             '처리 중...'}
          </h5>
          
          <p className={`card-text ${colorClass}`}>
            {message}
          </p>
          
          {/* 추가 안내 */}
          {status === 'processing' && (
            <small className="text-muted d-block mt-3">
              잠시만 기다려주세요. 이 창은 자동으로 닫힙니다.
            </small>
          )}
          
          {status === 'error' && (
            <small className="text-muted d-block mt-3">
              이 창은 3초 후 자동으로 닫힙니다.
            </small>
          )}
          
          {status === 'success' && (
            <small className="text-muted d-block mt-3">
              이 창은 1초 후 자동으로 닫힙니다.
            </small>
          )}
          
          {/* 수동 닫기 버튼 (에러 시에만) */}
          {status === 'error' && (
            <button 
              className="btn btn-outline-secondary btn-sm mt-3"
              onClick={() => {
                if (window.opener) {
                  window.close();
                } else {
                  window.location.href = '/';
                }
              }}
            >
              창 닫기
            </button>
          )}
        </div>
        
        {/* 디버그 정보 (개발 모드에서만) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="card-footer bg-light">
            <small className="text-muted">
              <strong>디버그:</strong><br/>
              URL: {window.location.href}<br/>
              Opener: {window.opener ? '있음' : '없음'}<br/>
              Status: {status}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;