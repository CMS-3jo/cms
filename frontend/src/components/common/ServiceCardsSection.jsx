// src/components/common/ServiceCardsSection.jsx
import React from 'react';

const ServiceCardsSection = () => {
  return (
    <section className="idx-cardarea">
      <div className="idx-card">
        <a href="/cnsl/psychological">
          <h2>심리상담 예약하기</h2>
          <p>심리상담과 정서적 지원을 제공합니다.</p>
          <img src="./images/user/idx-1.svg" alt="심리상담" />
        </a>
      </div>
      
      <div className="idx-card">
        <a href="/cnsl/academic">
          <h2>학업상담 예약하기</h2>
          <p>진로 및 경력 상담을 지원합니다.</p>
          <img src="./images/user/idx-2.svg" alt="학업상담" />
        </a>
      </div>
      
      <div className="idx-card">
        <a href="/self-diagnosis">
          <h2>자가 진단</h2>
          <p>자가 진단 테스트를 통해 자신의 감정을 점검해 보세요.</p>
          <img src="./images/user/idx-3.svg" alt="자가진단" />
        </a>
      </div>
      
      <div className="idx-card">
        <a href="/resources">
          <h2>자료실</h2>
          <p>상담 관련 자료를 공유합니다.<br /> 최신 정보를 확인하고 필요한 내용을 찾아보세요.</p>
          <img src="./images/user/idx-5.svg" alt="자료실" />
        </a>
      </div>
    </section>
  );
};

export default ServiceCardsSection;