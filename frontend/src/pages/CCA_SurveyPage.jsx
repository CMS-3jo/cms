// CCA_SurveyPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/NoncurricularList.css';

const CCASurveyPage = () => {
    const questions = [
        { id: 1, content: '나는 효과적으로 내 의사를 전달할 수 있다.' },
        { id: 2, content: '나는 복잡한 문제를 체계적으로 해결할 수 있다.' },
        { id: 3, content: '나는 나의 감정과 행동을 잘 통제한다.' },
        { id: 4, content: '나는 타인과 협력적으로 일할 수 있다.' },
        { id: 5, content: '나는 다양한 문화와 환경에 적응할 수 있다.' },
        { id: 6, content: '나는 직업적 책임과 윤리를 준수한다.' }
    ];

    const [answers, setAnswers] = useState({});

    const handleAnswerChange = (qId, value) => {
        setAnswers({
            ...answers,
            [qId]: value
        });
    };

    const handleSubmit = () => {
        console.log('설문 응답 결과:', answers);

        // 실제로는 axios.post('/api/cca-eval', { answers }) 호출
        alert('설문이 제출되었습니다.');
    };

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">

                    <h4>핵심역량 설문</h4>

                    <div className="survey-meta">
                        <p>핵심역량명: 예시 핵심역량명 (선택된 핵심역량명 출력 가능)</p>
                        <p>설문 문항 수: {questions.length}문항</p>
                    </div>

                    <div className="core-competency-survey-list">
                        {questions.map((q) => (
                            <div key={q.id} className="core-competency-survey-item">
                                <div className="survey-question">
                                    <strong>문항 {q.id}.</strong> {q.content}
                                </div>
                                <div className="survey-options">
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <label key={score} className="survey-option">
                                            <input
                                                type="radio"
                                                name={`q_${q.id}`}
                                                value={score}
                                                checked={answers[q.id] === score}
                                                onChange={() => handleAnswerChange(q.id, score)}
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
}

export default CCASurveyPage;
