// src/pages/CrisisCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const CrisisCounselingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApplyClick = () => {
    navigate('/cnsl/apply/06');
  };

  return (
    <>
      <PublicHeader />
      
      <header className="hero-section">
        <div className="hero-content">
          <h1>심리상담</h1>
        </div>
      </header>
      
      <main>
        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">심리상담</p>
            <ul>
              <li className={location.pathname === '/psychological' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/psychological'); }}>심리상담</a>
              </li>
              <li className={location.pathname === '/anonymous' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/anonymous'); }}>익명상담</a>
              </li>
              <li className={location.pathname === '/crisis' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/crisis'); }}>위기상담</a>
              </li>
            </ul>
          </nav>
          
          <div>
            <h5 className="text-center mt-5"><strong>위기상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/counseling3.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">위기상담</h5>
                    <p className="card-text px-5">
                      심각한 스트레스나 위기 상황에 직면했을 때, 전문 상담가가 즉각적이고 집중적인 지원을 제공하는 상담 서비스입니다. 
                      위기상담은 긴급한 상황에서 빠르고 효과적인 대응을 통해 개인의 안전과 안정성을 확보하고, 문제 해결의 기회를 제공하는 것을 목표로 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card m-5" style={{maxWidth: '100%'}}>
              <div className="card-body">
                <h5 className="card-title">외부 상담기관</h5><br />
                <p className="card-text">자살예방상담전화 | 1393</p>
                <p className="card-text">생명의 전화 24시간 Hot-line | 1588-9191</p>
                <p className="card-text">정신건강상담전화 | 1577-0199</p>
                <p className="card-text">보건복지부 콜센터 | 129</p>
              </div>
            </div>
            
            <span className="d-flex justify-content-center">
              <button type="button" className="btn btn-secondary" onClick={handleApplyClick}>
                상담신청
              </button>
            </span>
          </div>
        </article>
        
        <ChatbotButton />
      </main>
      
      <Footer />
    </>
  );
};

export default CrisisCounselingPage;