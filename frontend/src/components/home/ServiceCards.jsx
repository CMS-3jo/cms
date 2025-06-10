// src/components/home/ServiceCards.jsx
import React from 'react';

const ServiceCards = () => {
  const services = [
    {
      title: '심리상담 예약하기',
      description: '심리상담과 정서적 지원을 제공합니다.',
      image: '/images/icons/psychology.png',
      link: '/psychology/reservation'
    },
    {
      title: '학업상담 예약하기',
      description: '진로 및 학업 상담을 지원합니다.',
      image: '/images/icons/academic.png', 
      link: '/academic/reservation'
    },
    {
      title: '자가 진단',
      description: '자가 진단 테스트를 통해 자신의 성향을 확인해보세요.',
      image: '/images/icons/diagnosis.png',
      link: '/self-diagnosis'
    },
    {
      title: '자료실',
      description: '상담 관련 자료를 공유합니다.'+ 
        '최신 정보를 확인하고 필요한 자료를 이용해보세요.',
      image: '/images/icons/resources.png',
      link: '/resources'
    }
  ];

  return (
    <div className="idx-cardarea">
      {services.map((service, index) => (
        <div key={index}>
          <a href={service.link}>
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            <img src={service.image} alt={service.title} />
          </a>
        </div>
      ))}
    </div>
  );
};

export default ServiceCards;