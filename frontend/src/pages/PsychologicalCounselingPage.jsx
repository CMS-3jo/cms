// src/pages/PsychologicalCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const PsychologicalCounselingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleApplyClick = () => {
    navigate('/cnsl/apply/07');
  };

  return (
    <>
     <PublicHeader />

        <header >
          <div className="hero-content">
            {/* <h1>심리 상담</h1> */}
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
            <h5 className="text-center mt-5"><strong>심리상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/counseling1.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">심리상담</h5>
                    <p className="card-text px-5">
                      혼자 해결하기 힘든 어려움이 있을 때, 상담자와 함께 문제해결을 하기 위한 자기 이해 및 성장의 과정입니다. 
                      상담자와 일대일로 진행되며 여러 회기 동안 지속적으로 진행되기 때문에 여러문제에 대해 전문적이고도 심층적인 도움을 받을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="jumbotron mx-5">
              <h4>이럴 때 신청하세요</h4>
              <hr className="my-4" />
              <p className="mx-3"><strong>정서적 고통</strong></p>
              <p className="ml-5">우울감, 불안, 스트레스, 슬픔 등의 강한 감정을 지속적으로 경험할 때</p>
              <p className="mx-3"><strong>대인 관계 문제</strong></p>
              <p className="ml-5">친구, 가족, 동료와의 관계에서 갈등이나 문제가 발생하거나, 대인 관계에서 어려움을 겪을 때</p>
              <p className="mx-3"><strong>자아 문제</strong></p>
              <p className="ml-5">자기 자신에 대한 부정적인 인식, 낮은 자존감, 자기 가치감의 부족 등이 문제일 때</p>
              <p className="mx-3"><strong>심리적 외상</strong></p>
              <p className="ml-5">사고, 폭력, 성적 학대 등 심리적 외상이나 트라우마를 경험했을 때, 이러한 경험이 일상 생활에 영향을 미치고 있을 경우</p>
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

export default PsychologicalCounselingPage;