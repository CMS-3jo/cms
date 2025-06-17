import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useParams } from 'react-router-dom';
import '../../public/css/NoncurricularList.css';

const CCASurveyPage = () => {
  const { cciId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // localStorage 에서 토큰 꺼내기
  const token = localStorage.getItem('accessToken');
  let stdNo = '';
  if (token) {
    try {
      // JWT payload 부분(base64) 디코드
      const base64Payload = token.split('.')[1];
      const payloadJson = atob(base64Payload);
      const payload = JSON.parse(payloadJson);
      stdNo = payload.idNo || ''; // 토큰 생성 시 넣은 idNo 클레임
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
    }
  }

  useEffect(() => {
    fetch(`http://localhost:8082/api/core-cpt/${cciId}/questions`)
      .then(async res => {
        console.log('응답 상태코드:', res.status);
        const text = await res.text();
        console.log('응답 본문:', text);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        return JSON.parse(text);
      })
      .then(data => setQuestions(data))
      .catch(err => {
        console.error('문항 조회 실패:', err.message);
      });
  }, [cciId]);

  const handleAnswerChange = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const handleSubmit = async () => {
    const payload = {
      stdNo,      // 이제 진짜 학번(idNo) 이 들어갑니다
      cciId,
      answers: questions.map(q => ({
        qstId: q.qstId,
        score: answers[q.qstId] || 0
      }))
    };

    try {
      const response = await fetch('http://localhost:8082/api/core-cpt/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('설문이 제출되었습니다.');
      } else {
        const errText = await response.text();
        console.error('제출 실패:', errText);
        alert('제출 실패: 서버 오류');
      }
    } catch (error) {
      console.error('제출 중 오류:', error);
      alert('제출 중 오류 발생');
    }
  };

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <div className="noncur-list-page">
          <h4>핵심역량 설문</h4>

          <div className="survey-meta">
            <p>핵심역량 ID: {cciId}</p>
            <p>문항 수: {questions.length}문항</p>
            <p>사용자 학번: {stdNo}</p>
          </div>

          <div className="core-competency-survey-list">
            {questions.map((q, idx) => (
              <div key={q.qstId} className="core-competency-survey-item">
                <div className="survey-question">
                  <strong>문항 {idx + 1}.</strong> {q.qstCont}
                </div>
                <div className="survey-options">
                  {[1, 2, 3, 4, 5].map(score => (
                    <label key={score} className="survey-option">
                      <input
                        type="radio"
                        name={`q_${q.qstId}`}
                        value={score}
                        checked={answers[q.qstId] === score}
                        onChange={() => handleAnswerChange(q.qstId, score)}
                      />
                      <span className="custom-radio"></span> {score}점
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <button
              type="button"
              className="cca-list-item-button"
              onClick={handleSubmit}
            >
              설문 제출하기
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CCASurveyPage;
