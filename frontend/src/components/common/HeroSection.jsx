// src/components/common/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section className="hero-banner">
      <div className="container">
        <img className="mb-4" src="./images/slogan_career.png" alt="" width="250" />
        <div className="hero-content">
          <h1>한국방송통신대학 상담센터</h1>
          <p>학생들의 고민을 함께 해결합니다.</p>
          <a href="#" className="cta-button">자세히 알아보기</a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;