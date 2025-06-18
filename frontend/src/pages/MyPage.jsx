import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import '../../public/css/MyPage.css';

const MyPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [detailContent, setDetailContent] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, apiCall, checkCurrentUser } = useAuth();

  // 사용자 프로필 정보 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await apiCall('http://localhost:8082/api/mypage/profile', {
          method: 'GET',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserProfile(result.data);
          } else {
            setError(result.message || '프로필 정보를 불러오는데 실패했습니다.');
          }
        } else {
          setError('프로필 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('프로필 조회 실패:', err);
        setError('프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, apiCall]);

  // 임시 상담 활동 데이터 (추후 API 연동)
  const activities = [
    { id: 1, date: "2025-06-10", type: "심리상담", status: "완료", detail: "스트레스 관리 상담을 진행했습니다.", counselor: "김상담사" },
    { id: 2, date: "2025-06-05", type: "학업상담", status: "완료", detail: "진로 계획에 대한 상담을 받았습니다.", counselor: "이상담사" },
    { id: 3, date: "2025-05-28", type: "진로상담", status: "완료", detail: "취업 준비 방향에 대해 논의했습니다.", counselor: "박상담사" }
  ];

  // 임시 검사 기록 데이터 (추후 API 연동)
  const testRecords = [
    { id: 1, name: "심리상담 자가진단", date: "2025-06-08", score: 25, result: "보통" },
    { id: 2, name: "직업선호도 검사", date: "2025-06-01", score: 78, result: "우수" }
  ];

  // 사용자 타입별 라벨 반환
  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'STUDENT': return '학생';
      case 'PROFESSOR': return '교수';
      case 'COUNSELOR': return '상담사';
      case 'ADMIN': return '관리자';
      case 'GUEST': return '게스트';
      default: return '사용자';
    }
  };

  // 모달 관련 함수들
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setDetailContent('');
  };

  const openDetailModal = (activity) => {
    setDetailContent(`
      <div class="detail-card">
        <h3 style="color: #007bff; margin-bottom: 15px;">${activity.type} 상세내용</h3>
        <div class="detail-info">
          <div class="detail-row">
            <span class="detail-label">📅 날짜:</span>
            <span class="detail-value">${activity.date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📋 상태:</span>
            <span class="detail-value status-${activity.status}">${activity.status}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">👨‍⚕️ 상담사:</span>
            <span class="detail-value">${activity.counselor}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📝 내용:</span>
            <span class="detail-value">${activity.detail}</span>
          </div>
        </div>
      </div>
    `);
    setActiveModal('detail');
  };

  const backToActivities = () => {
    setDetailContent('');
    setActiveModal('my-activities');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case '완료': return '✅';
      case '진행중': return '⏳';
      case '예정': return '📅';
      default: return '📋';
    }
  };

  const getResultColor = (result) => {
    switch(result) {
      case '우수': return '#28a745';
      case '보통': return '#ffc107';
      case '주의': return '#dc3545';
      default: return '#6c757d';
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const handleModalClick = (event) => {
      if (event.target.classList.contains('modal')) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleModalClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleModalClick);
    };
  }, [activeModal]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">오류 발생</h4>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 프로필 정보가 없는 경우
  if (!userProfile) {
    return (
      <div className="mypage-body">
        <PublicHeader />
        <main>
          <div className="container_layout mypage-container">
            <div className="alert alert-warning" role="alert">
              프로필 정보를 찾을 수 없습니다.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mypage-body">
      <PublicHeader />
      
      <main>
        <div className="container_layout mypage-container">
          {/* 프로필 헤더 - 실제 데이터 사용 */}
          <div className="profile-header-new">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {userProfile.profileImageUrl ? (
                  <img 
                    src={userProfile.profileImageUrl} 
                    alt="프로필 이미지"
                    className="avatar-image"
                  />
                ) : (
                  <span className="avatar-text">{userProfile.userName?.charAt(0) || 'U'}</span>
                )}
              </div>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {userProfile.userName || '이름 없음'} 
                <span className="profile-badge">{getUserTypeLabel(userProfile.userType)}</span>
              </h1>
              <div className="profile-details">
                <div className="profile-item">
                  <span className="profile-icon">🆔</span>
                  <span>{userProfile.identifierNo || userProfile.userId}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-icon">🎓</span>
                  <span>
                    {userProfile.deptName || '소속 없음'}
                    {userProfile.gradeYear && ` ${userProfile.gradeYear}학년`}
                  </span>
                </div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-card">
                <div className="stat-number">{activities.length}</div>
                <div className="stat-label">총 상담 횟수</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{testRecords.length}</div>
                <div className="stat-label">검사 완료</div>
              </div>
            </div>
          </div>

          {/* 메뉴 카드들 */}
          <div className="menu-cards-grid">
            <div 
              className="menu-card"
              onClick={() => openModal('personal-info')}
            >
              <div className="menu-icon">👤</div>
              <h3>개인정보</h3>
              <p>연락처 및 주소 정보 확인</p>
              <div className="menu-arrow">→</div>
            </div>

            <div 
              className="menu-card"
              onClick={() => openModal('my-activities')}
            >
              <div className="menu-icon">💬</div>
              <h3>나의 상담활동</h3>
              <p>상담 기록 및 내용 확인</p>
              <div className="menu-arrow">→</div>
            </div>

            <div 
              className="menu-card"
              onClick={() => openModal('test-records')}
            >
              <div className="menu-icon">📊</div>
              <h3>나의 검사기록</h3>
              <p>심리검사 결과 및 점수 확인</p>
              <div className="menu-arrow">→</div>
            </div>
          </div>

          {/* 모달 */}
          <div 
            className={`modal ${activeModal ? 'show-modal' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content-new">
              <div className="modal-header-new">
                <h2>
                  {activeModal === 'personal-info' && '👤 개인정보'}
                  {activeModal === 'my-activities' && '💬 나의 상담활동'}
                  {activeModal === 'test-records' && '📊 나의 검사기록'}
                  {activeModal === 'detail' && '📋 상담내용 상세보기'}
                </h2>
                <button 
                  className="close-button-new"
                  onClick={activeModal === 'detail' ? backToActivities : closeModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body-new">
                {activeModal === 'personal-info' && (
                  <div className="info-cards">
                    <div className="info-card">
                      <h3>기본 정보</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">이름</span>
                          <span className="info-value">{userProfile.userName || '정보 없음'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">
                            {userProfile.userType === 'STUDENT' ? '학번' : '사번'}
                          </span>
                          <span className="info-value">{userProfile.identifierNo || '정보 없음'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">소속</span>
                          <span className="info-value">{userProfile.deptName || '정보 없음'}</span>
                        </div>
                        {userProfile.userType === 'STUDENT' && userProfile.gradeYear && (
                          <div className="info-item">
                            <span className="info-label">학년</span>
                            <span className="info-value">{userProfile.gradeYear}학년</span>
                          </div>
                        )}
                        
                      </div>
                    </div>
                    
                    <div className="info-card">
                      <h3>연락처 정보</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">이메일</span>
                          <span className="info-value">{userProfile.email || '정보 없음'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">전화번호</span>
                          <span className="info-value">{userProfile.phoneNumber || '정보 없음'}</span>
                        </div>
                        {(userProfile.postalCode || userProfile.address) && (
                          <div className="info-item full-width">
                            <span className="info-label">주소</span>
                            <span className="info-value">
                              {userProfile.postalCode && `(${userProfile.postalCode}) `}
                              {userProfile.address || '정보 없음'}
                              {userProfile.detailAddress && (
                                <>
                                  <br/>
                                  {userProfile.detailAddress}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 게스트 사용자 추가 정보 */}
                    {userProfile.userType === 'GUEST' && (
                      <div className="info-card">
                        <h3>소셜 로그인 정보</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">로그인 제공업체</span>
                            <span className="info-value">{userProfile.provider || '정보 없음'}</span>
                          </div>
                          {userProfile.lastLoginDate && (
                            <div className="info-item">
                              <span className="info-label">마지막 로그인</span>
                              <span className="info-value">
                                {new Date(userProfile.lastLoginDate).toLocaleString('ko-KR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 학생 추가 정보 */}
                    {userProfile.userType === 'STUDENT' && (
                      <div className="info-card">
                        <h3>학적 정보</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">학과</span>
                            <span className="info-value">{userProfile.deptName || '정보 없음'}</span>
                          </div>
                          {userProfile.gradeYear && (
                            <div className="info-item">
                              <span className="info-label">학년</span>
                              <span className="info-value">{userProfile.gradeYear}학년</span>
                            </div>
                          )}
                          {userProfile.enterDate && (
                            <div className="info-item">
                              <span className="info-label">입학일</span>
                              <span className="info-value">
                                {new Date(userProfile.enterDate).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 계정 정보 */}
                    <div className="info-card">
                      <h3>계정 정보</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">사용자 ID</span>
                          <span className="info-value">{userProfile.userId}</span>
                        </div>
                        {userProfile.accountCreatedDate && (
                          <div className="info-item">
                            <span className="info-label">계정 생성일</span>
                            <span className="info-value">
                              {new Date(userProfile.accountCreatedDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'my-activities' && (
                  <div className="activities-grid">
                    {activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="activity-card"
                        onClick={() => openDetailModal(activity)}
                      >
                        <div className="activity-header">
                          <span className="activity-icon">{getStatusIcon(activity.status)}</span>
                          <span className="activity-date">{activity.date}</span>
                        </div>
                        <h4 className="activity-title">{activity.type}</h4>
                        <p className="activity-counselor">상담사: {activity.counselor}</p>
                        <div className="activity-footer">
                          <span className={`activity-status status-완료`}>
                            {activity.status}
                          </span>
                          <span className="activity-arrow">자세히 보기 →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === 'test-records' && (
                  <div className="test-records-grid">
                    {testRecords.map((record) => (
                      <div key={record.id} className="test-record-card">
                        <div className="test-header">
                          <h4 className="test-name">{record.name}</h4>
                          <div 
                            className="test-result"
                            style={{ backgroundColor: getResultColor(record.result) }}
                          >
                            {record.result}
                          </div>
                        </div>
                        <div className="test-info">
                          <div className="test-score">
                            <span className="score-number">{record.score}</span>
                            <span className="score-label">점</span>
                          </div>
                          <div className="test-date">
                            📅 {record.date}
                          </div>
                        </div>
                        <div className="test-progress">
                          <div 
                            className="progress-bar"
                            style={{ width: `${Math.min(record.score, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeModal === 'detail' && (
                  <div>
                    <button 
                      className="back-button"
                      onClick={backToActivities}
                    >
                      ← 목록으로 돌아가기
                    </button>
                    <div 
                      className="detail-content-new"
                      dangerouslySetInnerHTML={{__html: detailContent}}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyPage;