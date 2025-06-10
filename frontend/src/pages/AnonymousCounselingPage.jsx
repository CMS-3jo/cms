// src/pages/AnonymousCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const AnonymousCounselingPage = () => {
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
            <h5 className="text-center mt-5"><strong>익명상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/counseling2.jpg" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">익명상담</h5>
                    <p className="card-text px-5">
                      익명상담은 사용자가 자신의 신원이나 개인 정보를 공개하지 않고 상담을 받을 수 있는 서비스를 말합니다. 
                      상담 과정에서 자신의 이름, 연락처, 또는 기타 식별 정보를 제공할 필요가 없습니다. 
                      이로 인해 신원 노출에 대한 걱정 없이 자유롭게 문제를 상담할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="jumbotron mx-5">
              <h4>이럴 때 신청하세요</h4>
              <hr className="my-4" />
              <p className="mx-3"><strong>민감한 문제</strong></p>
              <p className="ml-5">자살 생각, 성적 학대, 심각한 중독 문제 등 민감하고 개인적인 문제를 다룰 때</p>
              <p className="mx-3"><strong>프라이버시 보호</strong></p>
              <p className="ml-5">직장, 학교, 가족 등에서의 신원 노출이나 사생활 침해를 우려하는 경우</p>
              <p className="mx-3"><strong>경험 부족</strong></p>
              <p className="ml-5">상담을 받기 전 경험이 부족하거나 상담에 대해 불안한 감정을 느끼는 경우</p>
              <p className="mx-3"><strong>비밀 유지</strong></p>
              <p className="ml-5">법적 문제, 비밀을 지켜야 하는 상황(예: 고발, 법적 조치가 필요한 경우 등)</p>
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

export default AnonymousCounselingPage;