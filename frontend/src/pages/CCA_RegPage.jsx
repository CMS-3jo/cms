import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

import '../../public/css/CCARegPage.css';
import '../../public/css/NoncurricularList.css';
const COMPETENCIES = [
  '의사소통',
  '문제해결',
  '자기관리',
  '대인관계',
  '글로벌역량',
  '직업윤리 및 책임역량'
];

const CCARegPage = () => {
  const [step, setStep] = useState(1);

  // Step1
  const [surveyTitle, setSurveyTitle] = useState('');
  const [department, setDepartment] = useState('');

  // Step2: 역량별 질문들
  const [questionsByComp, setQuestionsByComp] = useState(
    COMPETENCIES.reduce((acc, comp) => {
      acc[comp] = [{ id: 1, content: '' }];
      return acc;
    }, {})
  );

  const handleAddQuestion = (comp) => {
    setQuestionsByComp(prev => {
      const list = prev[comp];
      const newId = list.length + 1;
      return { ...prev, [comp]: [...list, { id: newId, content: '' }] };
    });
  };

  const handleQuestionChange = (comp, id, value) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].map(q => q.id === id ? { ...q, content: value } : q)
    }));
  };

  const handleDeleteQuestion = (comp, id) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].filter(q => q.id !== id)
    }));
  };

  const handleNext = () => {
    if (!surveyTitle.trim() || !department) {
      alert('제목과 학과를 모두 입력해주세요.');
      return;
    }
    setStep(2);
  };

  const handlePrev = () => setStep(1);

  const handleSubmit = async () => {
    // 유효성: 최소 하나라도 비어있으면 막기
    for (let comp of COMPETENCIES) {
      if (questionsByComp[comp].some(q => !q.content.trim())) {
        alert(`${comp} 문항을 모두 입력해주세요.`);
        return;
      }
    }

    const payload = {
      title: surveyTitle,
      department,
      questions: COMPETENCIES.flatMap(comp =>
        questionsByComp[comp].map((q, idx) => ({
          competency: comp,
          order: idx + 1,
          content: q.content
        }))
      ),
      regUserId: 'admin001'  // 실제 로그인된 ID로 교체
    };

    try {
      const res = await fetch('http://localhost:8082/api/core-cpt/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('설문이 성공적으로 등록되었습니다.');
        window.location.reload();
      } else {
        alert('등록 실패: 서버 오류');
      }
    } catch (e) {
      console.error(e);
      alert('네트워크 오류');
    }
  };

  return (
    <>
      <Header />
      <div className="cca-reg-container">
        <Sidebar />
        <div className="cca-reg-content">

          <h3>핵심역량 설문 등록</h3>

          {step === 1 && (
            <div className="step step-1">
              <h4>Step 1. 설문 기본정보</h4>
              <div className="form-group">
                <label>설문 제목</label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={e => setSurveyTitle(e.target.value)}
                  placeholder="설문 제목을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>학과 선택</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                >
                  <option value="">-- 학과 선택 --</option>
                  <option value="컴퓨터공학과">컴퓨터공학과</option>
                  <option value="경영학과">경영학과</option>
                  <option value="심리학과">심리학과</option>
                  {/* 필요시 추가 */}
                </select>
              </div>
              <button className="btn-primary" onClick={handleNext}>
                다음 단계
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step step-2">
              <h4>Step 2. 역량별 문항 작성</h4>

              {COMPETENCIES.map(comp => (
                <div key={comp} className="comp-section">
                  <h5>{comp}</h5>
                  {questionsByComp[comp].map(q => (
                    <div key={q.id} className="question-row">
                      <label>문항 {q.id}</label>
                      <input
                        type="text"
                        value={q.content}
                        onChange={e => handleQuestionChange(comp, q.id, e.target.value)}
                        placeholder={`"${comp}" 관련 문항을 입력하세요`}
                      />
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteQuestion(comp, q.id)}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add"
                    onClick={() => handleAddQuestion(comp)}
                  >
                    문항 추가
                  </button>
                </div>
              ))}

              <div className="step-nav">
                <button className="btn-secondary" onClick={handlePrev}>
                  이전
                </button>
                <button className="btn-primary" onClick={handleSubmit}>
                  설문 등록하기
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
};

export default CCARegPage;
