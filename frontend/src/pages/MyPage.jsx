import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import '../../public/css/MyPage.css';

const MyPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [detailContent, setDetailContent] = useState('');

  const userInfo = {
    name: "홍길동",
    email: "hong@nate.com",
    department: "컴퓨터공학",
    counselingCount: 3,
    phone: "010-1234-5678",
    zipcode: "12345",
    address1: "서울시 마포구 신촌로 176",
    address2: "중앙빌딩 301호"
  };

  const activities = [
    { id: 1, date: "2025-06-10", type: "심리상담", status: "완료", detail: "스트레스 관리 상담을 진행했습니다." },
    { id: 2, date: "2025-06-05", type: "학업상담", status: "완료", detail: "진로 계획에 대한 상담을 받았습니다." },
    { id: 3, date: "2025-05-28", type: "진로상담", status: "완료", detail: "취업 준비 방향에 대해 논의했습니다." }
  ];

  const testRecords = [
    { id: 1, name: "심리상담 자가진단", date: "2025-06-08", score: 25 },
    { id: 2, name: "직업선호도 검사", date: "2025-06-01", score: 78 }
  ];

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
    setDetailContent('');
  };

  const openDetailModal = (activity) => {
    setDetailContent(`
      <h3>${activity.type} 상세내용</h3>
      <p><strong>날짜:</strong> ${activity.date}</p>
      <p><strong>상태:</b> ${activity.status}</p>
      <p><strong>내용:</strong> ${activity.detail}</p>
    `);
    setActiveModal('detail');
  };

  const backToActivities = () => {
    setDetailContent('');
    setActiveModal('my-activities');
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

  return (
    <div className="mypage-body">
      <PublicHeader />
      
      <main>
        
        {/* 
        <header className="hero-section"> 
          <div className="hero-content">
            <h1>마이페이지</h1>
          </div>
        </header>
            */}

        <div className="container_layout mypage-container">
          <div className="profile-header">
            <div>
              <h1>{userInfo.name} 개인정보</h1>
              <p>| 이메일 : {userInfo.email} |</p>
              <p>| 전공 학과 : {userInfo.department} |</p>
              <p>| 상담 횟수 : {userInfo.counselingCount}회 |</p>
            </div>
          </div>

          <ul className="nav-links">
            <li className="nav-link-item">
              <a 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  openModal('personal-info');
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#007bff';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#007bff';
                }}
              >
                개인정보
              </a>
            </li>
            <li className="nav-link-item">
              <a 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  openModal('my-activities');
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#007bff';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#007bff';
                }}
              >
                나의 상담활동
              </a>
            </li>
            <li className="nav-link-item">
              <a 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  openModal('test-records');
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#007bff';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#007bff';
                }}
              >
                나의 검사기록
              </a>
            </li>
          </ul>

          <div 
            className={`modal ${activeModal ? 'show-modal' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {activeModal === 'personal-info' && '개인정보'}
                  {activeModal === 'my-activities' && '나의 상담활동'}
                  {activeModal === 'test-records' && '나의 검사기록'}
                  {activeModal === 'detail' && '상담내용 상세보기'}
                </h2>
                <button 
                  className="close-button"
                  onClick={activeModal === 'detail' ? backToActivities : closeModal}
                  onMouseEnter={(e) => e.target.style.color = '#007bff'}
                  onMouseLeave={(e) => e.target.style.color = '#333'}
                >
                  &times;
                </button>
              </div>
              <div style={{marginTop: '20px'}}>
                {activeModal === 'personal-info' && (
                  <table className="mypage-table">
                    <thead>
                      <tr>
                        <th className="mypage-th">이름</th>
                        <th className="mypage-th">이메일</th>
                        <th className="mypage-th">전화번호</th>
                        <th className="mypage-th">우편번호</th>
                        <th className="mypage-th">주소</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="mypage-td">{userInfo.name}</td>
                        <td className="mypage-td">{userInfo.email}</td>
                        <td className="mypage-td">{userInfo.phone}</td>
                        <td className="mypage-td">{userInfo.zipcode}</td>
                        <td className="mypage-td">
                          <span>{userInfo.address1}</span><br/>
                          <span>{userInfo.address2}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeModal === 'my-activities' && (
                  <ul className="activity-list">
                    {activities.map((activity) => (
                      <li 
                        key={activity.id} 
                        className="list-item"
                        onClick={() => openDetailModal(activity)}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f0f0f0';
                          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#fafafa';
                          e.target.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
                        }}
                      >
                        <strong>${activity.date}</strong> - ${activity.type} (${activity.status})
                      </li>
                    ))}
                  </ul>
                )}

                {activeModal === 'test-records' && (
                  <ul className="test-records-list">
                    {testRecords.map((record) => (
                      <li key={record.id} className="list-item">
                        <strong>${record.name}</strong><br/>
                        검사일: ${record.date} | 점수: ${record.score}점
                      </li>
                    ))}
                  </ul>
                )}

                {activeModal === 'detail' && (
                  <div 
                    className="detail-content"
                    dangerouslySetInnerHTML={{__html: detailContent}}
                  />
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