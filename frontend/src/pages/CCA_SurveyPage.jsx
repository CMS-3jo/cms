import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useParams } from 'react-router-dom';
// 1. useAuth 훅을 import 합니다. 경로는 실제 파일 위치에 맞게 조정해주세요.
import { useAuth } from '../hooks/useAuth';
import '../../public/css/NoncurricularList.css';

const CCASurveyPage = () => {
  const { cciId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // 2. useAuth 훅을 호출하여 user 정보와 apiCall 함수를 가져옵니다.
  const { user, apiCall } = useAuth();

  // 3. Auth Context의 user 객체에서 학번(identifierNo)을 직접 가져옵니다.
  // user 정보가 로드되기 전에는 빈 문자열로 초기화합니다.
  const stdNo = user ? user.identifierNo : '';

  useEffect(() => {
    // 4. apiCall 함수를 사용하여 인증이 필요한 API를 안전하게 호출합니다.
    // 토큰이 만료되었을 경우 자동으로 재발급을 시도합니다.
    // 또한, 사용자 정보(user)가 로드된 후에 데이터를 불러오도록 조건을 추가합니다.
    if (user) {
      apiCall(`http://localhost:8082/api/core-cpt/${cciId}/questions`)
        .then(async res => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errText}`);
          }
          return res.json();
        })
        .then(data => setQuestions(data))
        .catch(err => {
          console.error('문항 조회 실패:', err.message);
        });
    }
  }, [cciId, user, apiCall]); // useEffect 의존성 배열에 user와 apiCall을 추가합니다.


  const handleAnswerChange = (qId, score) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
  };

  const handleSubmit = async () => {
    // 5. JWT를 직접 다루는 대신, Context에서 가져온 학번을 사용합니다.
    if (!stdNo) {
      alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해 주세요.');
      return;
    }

    const payload = {
      stdNo,      // Context에서 가져온 학번
      cciId,
      answers: questions.map(q => ({
        qstId: q.qstId,
        score: answers[q.qstId] || 0
      }))
    };

    try {
      // 6. 설문 제출 시에도 apiCall 함수를 사용하여 일관성과 안정성을 유지합니다.
      const response = await apiCall('http://localhost:8082/api/core-cpt/submit', {
        method: 'POST',
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
            {/* 7. Context에서 가져온 학번(stdNo)을 화면에 표시합니다. */}
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