// src/pages/PeerCounselingPage.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import ChatbotButton from '../components/common/ChatbotButton';
import Footer from '../components/layout/Footer';

const PeerCounselingPage = () => {
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
          <h1>기타상담</h1>
        </div>
      </header>
      
      <main>
        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">기타상담</p>
            <ul>
              <li className={location.pathname === '/peer' ? 'selected' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/peer'); }}>또래상담</a>
              </li>
            </ul>
          </nav>
          
          <div>
            <h5 className="text-center mt-5"><strong>또래상담</strong></h5><br />
            
            <div className="card mb-3 mx-5" style={{maxWidth: '100%'}}>
              <div className="row no-gutters">
                <div className="col-md-2">
                  <img src="/images/user/etc1.png" style={{maxWidth: '100%'}} className="p-3" />
                </div>
                <div className="col-md-10">
                  <div className="card-body">
                    <h5 className="card-title pl-5">또래상담</h5>
                    <p className="card-text px-5">
                      또래상담은 비슷한 나이대나 사회적 배경을 가진 사람들이 서로 상담하고 지원하는 프로세스를 의미합니다. 
                      이 상담의 주요 목적은 비슷한 경험을 공유하는 사람들 간의 상호 이해와 지원을 통해 개인의 문제를 해결하고, 
                      심리적, 정서적 지원을 제공하는 것입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="jumbotron mx-5">
              <h4>왜 하는 걸까요?</h4>
              <hr className="my-4" />
              <p className="mx-3"><strong>동등한 관계</strong></p>
              <p className="ml-5">비슷한 나이, 배경, 또는 경험을 공유하므로, 서로의 상황을 더 잘 이해하고 공감할 수 있습니다.</p>
              <p className="mx-3"><strong>상호 지원</strong></p>
              <p className="ml-5">또래 상담자는 자신의 경험을 바탕으로 조언을 제공하며, 문제 해결을 돕기 위해 자신의 경험이나 지식을 공유합니다.</p>
              <p className="mx-3"><strong>친밀함</strong></p>
              <p className="ml-5">친근하고 편안한 분위기에서 진행됩니다.</p>
              <p className="mx-3"><strong>서로 이해하기</strong></p>
              <p className="ml-5">서로의 상황과 문제를 이해하고, 보다 실제적인 조언을 제공할 수 있습니다.</p>
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

export default PeerCounselingPage;