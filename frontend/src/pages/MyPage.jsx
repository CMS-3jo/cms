// src/pages/MyPage.jsx
import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';

const MyPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [detailContent, setDetailContent] = useState('');

  // 샘플 데이터
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

  // 모달 열기
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  // 모달 닫기
  const closeModal = () => {
    setActiveModal(null);
    setDetailContent('');
  };

  // 상세보기 모달 열기
  const openDetailModal = (activity) => {
    setDetailContent(`
      <h3>${activity.type} 상세내용</h3>
      <p><strong>날짜:</strong> ${activity.date}</p>
      <p><strong>상태:</strong> ${activity.status}</p>
      <p><strong>내용:</strong> ${activity.detail}</p>
    `);
    setActiveModal('detail');
  };

  // 상세보기에서 돌아가기
  const backToActivities = () => {
    setDetailContent('');
    setActiveModal('my-activities');
  };

  // ESC 키 처리
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 모달 외부 클릭 처리
  const handleModalClick = (event) => {
    if (event.target.classList.contains('modal')) {
      closeModal();
    }
  };

  const bodyStyle = {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: 1.6,
    margin: 0,
    padding: 0,
    backgroundColor: '#f4f4f4'
  };

  const containerStyle = {
    width: '85%',
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  };

  const profileHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '2px solid #ddd',
    paddingBottom: '20px',
    marginBottom: '30px',
    background: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const navLinksStyle = {
    marginBottom: '30px',
    listStyle: 'none',
    padding: 0,
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px'
  };

  const navLinkItemStyle = {
    display: 'inline-block',
    marginRight: '20px'
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#007bff',
    fontSize: '18px',
    fontWeight: '500',
    padding: '10px',
    borderRadius: '5px',
    transition: 'background 0.3s, color 0.3s',
    cursor: 'pointer'
  };

  const modalStyle = {
    display: activeModal ? 'block' : 'none',
    position: 'fixed',
    zIndex: 1000,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  };

  const modalContentStyle = {
    backgroundColor: '#fff',
    margin: '15% auto',
    padding: '20px',
    borderRadius: '8px',
    width: 'auto',
    maxWidth: '80%',
    maxHeight: '80%',
    overflowY: 'auto',
    position: 'relative'
  };

  const modalHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px'
  };

  const closeButtonStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    background: '#fff',
    border: 'none',
    color: '#333',
    transition: 'color 0.3s'
  };

  const tableStyle = {
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '10px',
    tableLayout: 'auto'
  };

  const thStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left',
    backgroundColor: '#f2f2f2'
  };

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'left',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const listItemStyle = {
    background: '#fafafa',
    margin: '10px 0',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'background 0.3s, box-shadow 0.3s',
    cursor: 'pointer'
  };

  return (
    <div style={bodyStyle}>
      <PublicHeader />
      
      <main>
        <header className="hero-section">
          <div className="hero-content">
            <h1>마이페이지</h1>
          </div>
        </header>

        <div style={containerStyle}>
          <div style={profileHeaderStyle}>
            <div>
              <h1>{userInfo.name} 개인정보</h1>
              <p>| 이메일 : {userInfo.email} |</p>
              <p>| 전공 학과 : {userInfo.department} |</p>
              <p>| 상담 횟수 : {userInfo.counselingCount}회 |</p>
            </div>
          </div>

          <ul style={navLinksStyle}>
            <li style={navLinkItemStyle}>
              <a 
                className="open-modal"
                data-target="#personal-info-modal"
                style={navLinkStyle} 
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
            <li style={navLinkItemStyle}>
              <a 
                className="open-modal"
                data-target="#my-activities-modal"
                style={navLinkStyle} 
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
            <li style={navLinkItemStyle}>
              <a 
                className="open-modal"
                data-target="#settings-modal"
                style={navLinkStyle} 
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

          {/* 모달들 */}
          <div 
            className="modal" 
            style={modalStyle}
            onClick={handleModalClick}
          >
            <div style={modalContentStyle}>
              <div style={modalHeaderStyle}>
                <h2>
                  {activeModal === 'personal-info' && '개인정보'}
                  {activeModal === 'my-activities' && '나의 상담활동'}
                  {activeModal === 'test-records' && '나의 검사기록'}
                  {activeModal === 'detail' && '상담내용 상세보기'}
                </h2>
                <button 
                  className="close"
                  style={closeButtonStyle} 
                  onClick={activeModal === 'detail' ? backToActivities : closeModal}
                  onMouseEnter={(e) => e.target.style.color = '#007bff'}
                  onMouseLeave={(e) => e.target.style.color = '#333'}
                >
                  &times;
                </button>
              </div>
              <div style={{marginTop: '20px'}}>
                {activeModal === 'personal-info' && (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>이름</th>
                        <th style={thStyle}>이메일</th>
                        <th style={thStyle}>전화번호</th>
                        <th style={thStyle}>우편번호</th>
                        <th style={thStyle}>주소</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={tdStyle}>{userInfo.name}</td>
                        <td style={tdStyle}>{userInfo.email}</td>
                        <td style={tdStyle}>{userInfo.phone}</td>
                        <td style={tdStyle}>{userInfo.zipcode}</td>
                        <td style={tdStyle}>
                          <span>{userInfo.address1}</span><br/>
                          <span>{userInfo.address2}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeModal === 'my-activities' && (
                  <ul style={{listStyle: 'none', padding: 0}} id="activity-list">
                    {activities.map((activity) => (
                      <li 
                        key={activity.id} 
                        style={listItemStyle}
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
                        <strong>{activity.date}</strong> - {activity.type} ({activity.status})
                      </li>
                    ))}
                  </ul>
                )}

                {activeModal === 'test-records' && (
                  <ul style={{listStyle: 'none', padding: 0}}>
                    {testRecords.map((record) => (
                      <li key={record.id} style={listItemStyle}>
                        <strong>{record.name}</strong><br/>
                        검사일: {record.date} | 점수: {record.score}점
                      </li>
                    ))}
                  </ul>
                )}

                {activeModal === 'detail' && (
                  <div 
                    id="detail-content" 
                    style={{marginTop: '20px'}}
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