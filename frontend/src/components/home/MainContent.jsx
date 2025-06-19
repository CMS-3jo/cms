// src/components/home/MainContent.jsx
import React from 'react';

const MainContent = () => {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
          편안한 마음, 밝은미래를 함께할 전문인
        </p>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px' }}>
          진로·심리상담실
        </h1>
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '30px' }}>
          한국방송통신대학교 상담센터
        </h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
          학생들의 꿈이 함께 해겠습니다.
        </p>
        <button 
          className="btn cta-button"
          onClick={() => window.location.href = '/center-intro'}
        >
          자가진단 받아보기
        </button>
      </div>
    </div>
  );
};

export default MainContent;