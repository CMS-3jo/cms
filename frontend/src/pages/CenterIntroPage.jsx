// src/pages/CenterIntroPage.jsx
import React, { useState } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import ChatbotButton from '../components/common/ChatbotButton';

const CenterIntroPage = ({ activeTab = 'intro' }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);

  // 센터 소개 내용
  const IntroContent = () => (
    <div>
      <div className="main-container">
        <div className="header">
          <h4>센터 소개</h4>
          <div className="divider"></div>
        </div>
        <div className="intro-card">
          <h2>한국방송통신대학교 CMS 소개</h2>
          <p>한국방송통신대학교는 혁신적이고 실용적인 정보기술 교육을 통해 미래의 IT 리더를 양성하는 것을 목표로 하고 있습니다. 우리 공대는 최첨단 기술과 연구에 기반한 교육을 제공하며, 학생들에게 실무 중심의 교육을 통해 글로벌 IT 산업의 요구에 부응할 수 있는 역량을 키워주고 있습니다.</p>
          <p className="highlight">학생상담센터는 공대 내 모든 학생들에게 심리적, 정서적 지원을 제공하는 중요한 역할을 하고 있습니다. 우리는 학생들이 학업과 개인적 도전에 효과적으로 대처할 수 있도록 다양한 상담 서비스와 지원 프로그램을 운영하고 있습니다.</p>
          <p>여러분이 우리 센터에서 제공하는 서비스를 통해 더욱 건강하고 만족스러운 대학 생활을 영위하시길 바랍니다.</p>
        </div>
        <div className="divider"></div>
      </div>
    </div>
  );

  // 업무 소개 내용
  const BusinessContent = () => (
    <div>
      <div style={businessStyles.mainContainer}>
        <h2 style={businessStyles.introTitle}>상담 업무 소개</h2>
        <div style={businessStyles.cardContainer}>
          <div style={businessStyles.card}>
            <h3><span style={businessStyles.emoji}>💬</span>개인 심리 상담</h3>
            <p>개인의 심리적 문제를 이해하고 지원하는 상담입니다. 정서적 어려움, 스트레스 관리 등 다양한 문제를 다룹니다.</p>
          </div>
          <div style={businessStyles.card}>
            <h3><span style={businessStyles.emoji}>📚</span>학업 상담</h3>
            <p>학업과 관련된 스트레스나 고민을 해결하는 상담입니다. 학업 계획, 성적 향상, 진로 문제 등을 지원합니다.</p>
          </div>
          <div style={businessStyles.card}>
            <h3><span style={businessStyles.emoji}>👥</span>집단 상담</h3>
            <p>집단 내 상호 지원을 통해 문제를 해결하고 개인적인 성장을 도모합니다. 그룹 활동과 워크숍이 포함됩니다.</p>
          </div>
          <div style={businessStyles.card}>
            <h3><span style={businessStyles.emoji}>🚨</span>위기 개입</h3>
            <p>위기 상황에서 즉각적인 지원을 제공합니다. 긴급 상황에서 필요한 개입과 도움을 신속하게 제공합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 조직도 내용
  const OrganizationContent = () => (
    <div>
      <div style={orgStyles.mainContainer}>
        <h2 style={orgStyles.introTitle}>조직도 소개</h2>
        <div style={orgStyles.orgChartContainer}>
          <div style={orgStyles.orgChartRow}>
            <div style={{...orgStyles.orgChartCard, ...orgStyles.centerCard}}>
              <h3><span style={orgStyles.emoji}>👤</span>센터장</h3>
              <p>센터의 전반적인 업무를 총괄합니다.</p>
            </div>
          </div>

          <div style={{...orgStyles.orgChartRow, ...orgStyles.cardRow1}}>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>💬</span>상담원 1</h3>
              <p>개인 심리 상담을 담당합니다.</p>
            </div>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>📚</span>상담원 2</h3>
              <p>학업 상담을 담당합니다.</p>
            </div>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>👥</span>상담원 3</h3>
              <p>집단 상담 및 워크숍을 담당합니다.</p>
            </div>
          </div>

          <div style={{...orgStyles.orgChartRow, ...orgStyles.cardRow2}}>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>🚨</span>상담원 4</h3>
              <p>위기 개입을 담당합니다.</p>
            </div>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>🛠️</span>상담원 5</h3>
              <p>상담원 1의 보조 역할을 수행합니다.</p>
            </div>
            <div style={orgStyles.orgChartCard}>
              <h3><span style={orgStyles.emoji}>🛠️</span>상담원 6</h3>
              <p>상담원 2의 보조 역할을 수행합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 찾아오는 길 내용
  const LocationContent = () => (
    <div>
      <div className="main-container">
        <div className="header">
          <h4>찾아오는길</h4>
          <div className="divider"></div>
        </div>
        <div className="intro-card">
          <h2>한국방송통신대학교 위치</h2>
          <p>지도출력 파트</p>
        </div>
        <div className="divider"></div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(currentTab) {
      case 'intro':
        return <IntroContent />;
      case 'business':
        return <BusinessContent />;
      case 'organization':
        return <OrganizationContent />;
      case 'location':
        return <LocationContent />;
      default:
        return <IntroContent />;
    }
  };

  // 업무소개 스타일
  const businessStyles = {
    mainContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px'
    },
    introTitle: {
      fontSize: '2rem',
      color: '#388e3c',
      marginBottom: '30px'
    },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(2, auto)',
      gap: '20px',
      justifyItems: 'center',
      width: '100%'
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      width: '100%',
      textAlign: 'center',
      transition: 'transform 0.3s, box-shadow 0.3s'
    },
    emoji: {
      fontSize: '1.5rem',
      marginRight: '10px'
    }
  };

  // 조직도 스타일
  const orgStyles = {
    mainContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    introTitle: {
      fontSize: '1.8rem',
      color: '#388e3c',
      marginBottom: '20px'
    },
    orgChartContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      height: '600px'
    },
    orgChartRow: {
      display: 'flex',
      justifyContent: 'center',
      position: 'relative',
      marginBottom: '20px'
    },
    orgChartCard: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
      padding: '10px',
      width: '140px',
      textAlign: 'center',
      transition: 'transform 0.3s, box-shadow 0.3s',
      zIndex: 1,
      margin: '0 15px'
    },
    centerCard: {
      position: 'absolute',
      top: '0',
      left: 'calc(50% - 70px)'
    },
    cardRow1: {
      position: 'absolute',
      top: '100px',
      left: '0',
      right: '0',
      justifyContent: 'center'
    },
    cardRow2: {
      position: 'absolute',
      top: '200px',
      left: '0',
      right: '0',
      justifyContent: 'center'
    },
    emoji: {
      fontSize: '1.5rem',
      marginRight: '5px'
    }
  };

  return (
    <div>
      <PublicHeader />
      
      <main>
        <header className="hero-section">
          <div className="hero-content">
            <h1>센터 소개</h1>
          </div>
        </header>

        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">센터소개</p>
            <ul>
              <li className={currentTab === 'intro' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentTab('intro'); }}>센터소개</a>
              </li>
              <li className={currentTab === 'business' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentTab('business'); }}>업무소개</a>
              </li>
              <li className={currentTab === 'organization' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentTab('organization'); }}>조직도</a>
              </li>
              <li className={currentTab === 'location' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentTab('location'); }}>찾아오는길</a>
              </li>
            </ul>
          </nav>

          <section className="contents">
            {renderContent()}
          </section>
        </article>

        <ChatbotButton />
      </main>
      
      <Footer />
    </div>
  );
};

export default CenterIntroPage;