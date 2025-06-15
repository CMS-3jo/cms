// src/pages/CareerCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const CareerCounselingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApplyClick = () => {
    navigate('/cnsl/apply/07');
  };

  return (
    <>
      <PublicHeader />
      
      <header className="hero-section">
        <div className="hero-content">
          <h1>학업상담</h1>
        </div>
      </header>
      
      <main>
        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">학업상담</p>
            <ul>
              <li className={location.pathname === '/career' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/career'); }}>진로상담</a>
              </li>
              <li className={location.pathname === '/employment' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/employment'); }}>취업상담</a>
              </li>
              <li className={location.pathname === '/professor' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/professor'); }}>교수상담</a>
              </li>
              <li className={location.pathname === '/academic-consulting' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/academic-consulting'); }}>학업 컨설팅</a>
              </li>
            </ul>
          </nav>
          
          <div>
            <h5 className="text-center mt-5"><strong>진로상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/academic1.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">진로상담</h5>
                    <p className="card-text px-5">
                      진로상담은 개인이 자신의 직업적 목표를 설정하고, 직업 선택 및 경로를 탐색하는 데 도움을 주는 상담 서비스입니다. 
                      이 과정에서는 개인의 흥미, 적성, 가치관, 기술 등을 고려하여 적합한 진로 방향을 찾아주는 것을 목표로 합니다. 
                      진로상담은 주로 직업 선택, 경력 개발, 직업 적합성 평가 등과 관련된 다양한 측면을 다룹니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="p-5">상담을 신청하려면 아래의 버튼을 클릭하시기 바랍니다.</p>
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

export default CareerCounselingPage;