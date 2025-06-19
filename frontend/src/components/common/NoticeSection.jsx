// src/components/home/NoticeSection.jsx
import React, { useState, useEffect } from 'react';
import '../../../public/css/NoticeSection.css';

const NoticeSection = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 호출 함수
  const fetchNotices = React.useCallback(async () => {
    try {
      setLoading(true);
      // console.log('API 호출 시작: /api/notices');
      
      const response = await fetch('/api/notices');
      // console.log('응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 공지사항을 불러오는데 실패했습니다.`);
      }
      
      const data = await response.json();
      setNotices(data);
      setError(null);
    } catch (err) {
      console.error('API 호출 에러:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // console.log('useEffect 실행됨');
    fetchNotices();
  }, [fetchNotices]);

  // 공지사항 클릭 핸들러
  const handleNoticeClick = (noticeId) => {
    // console.log('공지사항 클릭:', noticeId);
    window.location.href = `/notices/${noticeId}`;
  };

  const handleMoreNotices = () => {
    window.location.href = '/notices';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 조회수 포맷팅 함수
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toLocaleString();
  };

  if (loading) {
    return (
      <div className="notice-section">
        <h2 className="section-title">공지사항</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notice-section">
        <h2 className="section-title">공지사항</h2>
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={fetchNotices} className="retry-btn">
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-section">
      <h2 className="section-title">공지사항</h2>
      
      {notices.length === 0 ? (
        <div className="empty-container">
          <p>📢 등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="notices-grid">
          {notices.map((notice, index) => (
            <div 
              key={notice.noticeId} 
              className="notice-card"
              onClick={() => handleNoticeClick(notice.noticeId)}
            >
              <div className="card-header">
                <h3 className="notice-title">{notice.title}</h3>
                <span className="reg-date"> {formatDate(notice.regDt)}</span>
              </div>
              
              <div className="card-body">
                <div 
                  className="notice-content" 
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="more-button-container">
        <button 
          className="more-btn"
          onClick={handleMoreNotices}
        >
          공지사항 더보기 →
        </button>
      </div>
    </div>
  );
};

export default NoticeSection;