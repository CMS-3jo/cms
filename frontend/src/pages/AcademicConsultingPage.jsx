// src/pages/AcademicConsultingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const AcademicConsultingPage = () => {
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
            <h5 className="text-center mt-5"><strong>학업 컨설팅</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/academic4.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">학업 컨설팅</h5>
                    <p className="card-text px-5">
                      학업 컨설팅은 학생이나 학습자가 자신의 학업 목표를 달성하고, 학습 성과를 향상시키기 위해 전문적인 조언과 지원을 받는 과정입니다. 
                      학업 컨설팅은 교육과정, 학습 전략, 시간 관리, 학습 스타일, 성적 향상 등 다양한 학업 관련 문제를 다룹니다.
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

export default AcademicConsultingPage;