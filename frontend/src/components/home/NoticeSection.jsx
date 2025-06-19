// src/components/home/NoticeSection.jsx
import React, { useState, useEffect } from 'react';
import { useNotices } from '../../hooks/useNotices';

const NoticeSection = () => {
  const { notices, loading, error, fetchNotices } = useNotices();

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleMoreNotices = () => {
    window.location.href = '/notices';
  };

  if (loading) {
    return (
      <div className="news-item">
        <section>
          <h5 style={{ textAlign: 'center', margin: '40px 0' }}>공지사항</h5>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            로딩 중...
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="news-item">
      <section>
        <h5 style={{ textAlign: 'center', margin: '40px 0' }}>공지사항</h5>
        <table className="table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr>
                   <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((notice, index) => (
                <tr key={notice.id} style={{ cursor: 'pointer' }}>
                  <td>{notices.length - index}</td>
                  <td>{notice.title}</td>
                  <td>{notice.regUserId}</td>
                  <td>{notice.viewCnt}</td>
                  <td>{notice.regDt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div>
          <button 
            className="btn btn-secondary"
            onClick={handleMoreNotices}
          >
            공지사항 더보기
          </button>
        </div>
      </section>
    </div>
  );
};

export default NoticeSection;