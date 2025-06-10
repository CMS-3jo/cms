// src/pages/EmploymentCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const EmploymentCounselingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApplyClick = () => {
    navigate('/apply');
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
            <h5 className="text-center mt-5"><strong>취업상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/academic2.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">취업상담</h5>
                    <p className="card-text px-5">
                      취업상담은 개인이 취업 시장에 성공적으로 진입하고, 직업을 찾으며, 직무 적합성을 높이기 위해 전문적인 조언과 지원을 받는 과정입니다. 
                      취업상담은 구직자에게 취업 준비, 직무 탐색, 경력 개발 등 다양한 측면에서 도움을 제공합니다.
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

export default EmploymentCounselingPage;