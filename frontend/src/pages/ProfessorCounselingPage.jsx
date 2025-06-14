// src/pages/ProfessorCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const ProfessorCounselingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApplyClick = () => {
    navigate('/apply/07');
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
            <h5 className="text-center mt-5"><strong>교수상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/academic3.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">교수상담</h5>
                    <p className="card-text px-5">
                      교수상담은 대학이나 교육 기관에서 교수와 학생 간에 이루어지는 상담을 의미합니다. 
                      이 상담은 학업, 연구, 경력 개발, 개인적인 문제 등 다양한 주제에 대해 이루어질 수 있으며, 
                      교수는 학생에게 학문적 및 직업적 조언과 지원을 제공하는 역할을 합니다.
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

export default ProfessorCounselingPage;