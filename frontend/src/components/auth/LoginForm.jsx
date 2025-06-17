import React, { useState } from 'react'
import { FaGoogle, FaUser, FaLock } from 'react-icons/fa'
import { SiKakaotalk, SiNaver } from 'react-icons/si'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const LoginForm = () => {
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('school')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { login, googleLogin, kakaoLogin, naverLogin } = useAuth()

  // 일반 로그인 처리
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const loginData = {
        id,
        password,
        userType
      }
      
      const result = await login(loginData)
      console.log('일반 로그인 성공:', result)
      navigate('/') // 로그인 성공시 메인으로 이동
    } catch (err) {
      console.error('일반 로그인 실패:', err)
      setError(err.message || '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 백엔드 OAuth 소셜 로그인 처리
  const handleSocialLogin = async (provider) => {
    setError('')
    setIsLoading(true)

    try {
      let result;
      
      switch (provider) {
        case 'kakao':
          result = await kakaoLogin();
          break;
        case 'google':
          result = await googleLogin();
          break;
        case 'naver':
          result = await naverLogin();
          break;
        default:
          throw new Error('지원하지 않는 로그인 방식입니다');
      }

      // 로그인 성공
      console.log(`${provider} 로그인 성공:`, result);
      navigate('/');
      
    } catch (err) {
      console.error(`${provider} 로그인 실패:`, err);
      setError(err.message || `${provider} 로그인에 실패했습니다.`);
    } finally {
      setIsLoading(false);
    }
  }

  const isExternal = userType === 'external'

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg border-0" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-5">
          {/* 로고 및 제목 */}
          <div className="text-center mb-4">
            <img 
              src="/images/logo-header.png" 
              alt="방송통신대학교 로고" 
              className="mb-3"
              style={{ width: '200px', height: 'auto' }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <h4 className="fw-bold text-dark mb-2">방송통신대학교 로그인</h4>
            <p className="text-muted small mb-0">
              {isExternal 
                ? '교외 회원은 소셜 로그인을 사용해 주세요.'
                : '대학 구성원은 방송통신대학교 아이디와 패스워드를 사용해 주세요.'}
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              <small>{error}</small>
            </div>
          )}

          {/* 사용자 유형 선택 */}
          <div className="d-flex justify-content-center mb-4">
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="userType"
                  id="schoolUser"
                  value="school"
                  checked={userType === 'school'}
                  onChange={(e) => setUserType(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="schoolUser">
                  <span className="radio-circle"></span>
                  학교
                </label>
              </div>
              
              <div className="radio-item">
                <input
                  type="radio"
                  name="userType"
                  id="externalUser"
                  value="external"
                  checked={userType === 'external'}
                  onChange={(e) => setUserType(e.target.value)}
                  disabled={isLoading}
                />
                <label htmlFor="externalUser">
                  <span className="radio-circle"></span>
                  교외
                </label>
              </div>
            </div>
          </div>

          {/* 로그인 폼 또는 소셜 로그인 */}
          {!isExternal ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <div className="custom-input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="학번 또는 사번"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="custom-input-group">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    className="custom-input"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary w-100 py-2 mb-3" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          ) : (
            <div className="mb-3">
              <p className="text-center text-muted mb-3 small">소셜 계정으로 로그인</p>
              <div className="social-login-container-simple">
                <button
                  className="social-btn-simple kakao-simple"
                  onClick={() => handleSocialLogin('kakao')}
                  disabled={isLoading}
                  title="카카오 로그인"
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <SiKakaotalk size={24} />
                  )}
                </button>
                
                <button
                  className="social-btn-simple naver-simple"
                  onClick={() => handleSocialLogin('naver')}
                  disabled={isLoading}
                  title="네이버 로그인"
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <SiNaver size={24} />
                  )}
                </button>
                
                <button
                  className="social-btn-simple google-simple"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  title="구글 로그인"
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <FaGoogle size={20} />
                  )}
                </button>
              </div>
              
              {/* 로딩 중일 때 메시지 */}
              {isLoading && (
                <p className="text-center text-muted mt-3 small">
                  소셜 로그인 처리 중...
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default LoginForm