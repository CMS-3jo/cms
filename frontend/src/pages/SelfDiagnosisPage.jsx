// src/pages/SelfDiagnosisPage.jsx
import React, { useEffect } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import ChatbotButton from '../components/common/ChatbotButton';

const SelfDiagnosisPage = () => {
  const diagnosisData = [
    {
      title: "심리상담 자가진단",
      description: "심리상담 자가진단은 개인의 심리적 상태를 평가하여 정신 건강을 자가 점검할 수 있는 검사입니다.",
      url: "https://docs.google.com/forms/d/e/1FAIpQLScilD96BS8OJQ9b0kgGHwPlw-oLbDIDKoB_-bEVHafVxiKZYQ/viewform"
    },
    {
      title: "직업선호도 검사 S형",
      description: "직업선호도 검사는 좋아하는 활동, 관심 있는 직업, 선호하는 분야를 탐색하여 여러분의 직업흥미유형에 적합한 직업들을 제공해 줍니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduPreSNewDetail.do"
    },
    {
      title: "직업선호도 검사 L형",
      description: "직업선호도 검사는 좋아하는 활동, 관심 있는 직업, 선호하는 분야를 탐색하여 여러분의 직업흥미유형에 적합한 직업들을 제공해 줍니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduPreLNewDetail.do"
    },
    {
      title: "구직준비도검사",
      description: "구직을 희망하는 사람들이 성공적인 구직을 할 준비가 되어 있는가를 알아보고, 이를 토대로 적합한 취업지원 서비스를 선택할 수 있도록 해주는 검사입니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduEquipDetail.do"
    },
    {
      title: "창업적성검사",
      description: "창업을 희망하는 개인에게 창업소질이 있는지를 진단해주고, 가장 적합한 업종이 무엇인지 추천해 줍니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduFoundAptdDetail.do"
    },
    {
      title: "직업가치관검사",
      description: "직업선택 시 중요하게 생각하는 직업가치관을 측정하여 자신의 직업가치를 확인하고 그에 적합한 직업분야를 안내해 줍니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExamNew/adltOccpOsvDetail.do"
    },
    {
      title: "영업직무 기본역량검사",
      description: "영업직무수행과 관련한 역량을 인성과 적성의 측면으로 측정하여 영업직무에 대한 여러분의 역량의 적합도를 확인 할 수 있도록 해드립니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduCapaDetail.do"
    },
    {
      title: "IT직무 기본역량검사",
      description: "IT직무수행과 관련한 역량을 인성과 적성의 측면으로 측정하여 IT직무에 대한 여러분의 역량의 적합도를 확인할 수 있도록 해드립니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduItCapaDetail.do"
    },
    {
      title: "대학생 진로준비도 검사",
      description: "대학생 및 취업을 준비하는 대졸 청년층 구직자들을 대상으로 하며, 진로발달수준과 취업준비 행동수준에 대한 객관적인 정보를 바탕으로 효과적인 진로 및 취업선택을 지원하고자 개발된 검사입니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/univJobPreDetail.do"
    },
    {
      title: "성인용 직업적성검사",
      description: "직업선택 시 중요한 능력과 적성을 토대로 적합한 직업을 선택할 수 있도록 도와주기 위한 검사입니다.",
      url: "https://www.work.go.kr/consltJobCarpa/jobPsyExam/aduAptNewDetail.do"
    }
  ];

  const handleButtonClick = (url, event) => {
    event.stopPropagation();
    window.location.href = url;
  };

  const containerStyle = {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)'
  };

  const diagnosisListStyle = {
    listStyle: 'none',
    padding: 0
  };

  const listItemStyle = {
    background: '#ffffff',
    margin: '15px 0',
    padding: '20px',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  const descriptionStyle = {
    display: 'none',
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #ddd',
    zIndex: 1
  };

  const buttonStyle = {
    position: 'absolute',
    right: '20px',
    top: '10px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background 0.3s ease'
  };

  return (
    <div>
      <PublicHeader />
      
      <header >
        <div className="hero-content">
          {/* <h2>자가진단</h2> */}
        </div>
      </header>

      <main>
        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">자가진단</p>
            <ul>
              <li className="selected"><a href="#">자가진단</a></li>
              <li><a href="#">자가진단 결과</a></li>
            </ul>
          </nav>

          <section className="contents">
            <div>
              <div style={containerStyle}>
                <h4 style={{ textAlign: 'left' }} className="board_title">
                  자가진단 및 워크넷 심리 검사 목록
                </h4>
                <ul style={diagnosisListStyle} className="diagnosis-list">
                  {diagnosisData.map((item, index) => (
                    <li 
                      key={index} 
                      style={listItemStyle}
                      data-url={item.url} 
                      data-description={item.description}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#f9f9f9';
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        const desc = e.target.querySelector('.description');
                        if (desc) desc.style.display = 'block';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ffffff';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        const desc = e.target.querySelector('.description');
                        if (desc) desc.style.display = 'none';
                      }}
                    >
                      <strong>{item.title}</strong>
                      <div className="description" style={descriptionStyle}>{item.description}</div>
                      <button 
                        style={buttonStyle}
                        onClick={(e) => handleButtonClick(item.url, e)}
                        onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                        onMouseLeave={(e) => e.target.style.background = '#007bff'}
                      >
                        검사하기
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </article>

        <ChatbotButton />
      </main>
      
      <Footer />
    </div>
  );
};

export default SelfDiagnosisPage;