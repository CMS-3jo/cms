import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../../public/css/CCARegPage.css';
import '../../public/css/NoncurricularList.css';

const COMPETENCIES = [
  '의사소통', '문제해결', '자기관리', '대인관계', '글로벌역량', '직업윤리 및 책임역량'
];

const CCARegPage = () => {
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [questionsByComp, setQuestionsByComp] = useState(
    COMPETENCIES.reduce((acc, comp) => {
      acc[comp] = [{ id: 1, content: '' }];
      return acc;
    }, {})
  );

  useEffect(() => {
    fetch('/api/dept/students')
      .then(res => res.json())
      .then(setDepartments)
      .catch(console.error);

    fetch('/api/core-cpt/list')
      .then(res => res.ok ? res.json() : [])
      .then(data => setSurveys(Array.isArray(data) ? data : []))
      .catch(() => setSurveys([]));
  }, []);

  const handleAddQuestion = comp => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: [...prev[comp], { id: Date.now(), content: '' }]
    }));
  };

  const handleDeleteQuestion = (comp, id) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].filter(q => q.id !== id)
    }));
  };

  const handleQuestionChange = (comp, id, value) => {
    setQuestionsByComp(prev => ({
      ...prev,
      [comp]: prev[comp].map(q => q.id === id ? { ...q, content: value } : q)
    }));
  };

  const handleSubmit = async () => {
    for (let comp of COMPETENCIES) {
      if (questionsByComp[comp].some(q => !q.content.trim())) {
        alert(`${comp} 문항을 모두 입력해주세요.`);
        return;
      }
    }

    const payload = {
      title: surveyTitle,
      ccaId: department,
      questions: COMPETENCIES.flatMap(comp =>
        questionsByComp[comp].map((q, idx) => ({ order: idx + 1, content: q.content }))
      ),
      regUserId: 'admin001'
    };

    try {
      const res = await fetch(
        isEditing ? `/api/core-cpt/${editId}` : '/api/core-cpt/register',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (res.ok) {
        alert(isEditing ? '설문이 수정되었습니다.' : '설문이 성공적으로 등록되었습니다.');
        const updated = await fetch('/api/core-cpt/list').then(r => r.json());
        setSurveys(updated);
        handleCancelEdit();
      } else {
        alert('서버 오류 발생');
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  const handleDeleteSurvey = async cciId => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/core-cpt/${cciId}`, { method: 'DELETE' });
      if (res.ok) {
        setSurveys(surveys.filter(s => s.cciId !== cciId));
      } else {
        alert('삭제 실패');
      }
    } catch {
      alert('네트워크 오류');
    }
  };

  const assignQuestions = questions => {
    const byComp = COMPETENCIES.reduce((acc, comp) => { acc[comp] = []; return acc; }, {});
    const perComp = Math.ceil(questions.length / COMPETENCIES.length);
    questions.forEach((q, idx) => {
      const compIdx = Math.min(COMPETENCIES.length - 1, Math.floor(idx / perComp));
      byComp[COMPETENCIES[compIdx]].push({ id: q.order, content: q.content });
    });
    return byComp;
  };

  const handleEditSurvey = async cciId => {
    try {
      const res = await fetch(`/api/core-cpt/${cciId}`);
      if (!res.ok) throw new Error('조회 실패');
      const data = await res.json();
      setSurveyTitle(data.title);
      setDepartment(data.ccaId);
      setQuestionsByComp(assignQuestions(data.questions));
      setEditId(cciId);
      setIsEditing(true);
      setStep(1);
    } catch {
      alert('설문 조회 실패');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setStep(1);
    setSurveyTitle('');
    setDepartment('');
    setQuestionsByComp(
      COMPETENCIES.reduce((acc, comp) => {
        acc[comp] = [{ id: 1, content: '' }];
        return acc;
      }, {})
    );
  };

  return (
    <>
      <Header />
      <div className="cca-reg-container">
        <Sidebar />
        <div className="cca-reg-content">
          <h3>핵심역량 설문 관리</h3>

          <section className="survey-list">
            <h4>설문 리스트</h4>
            <table>
              <thead>
                <tr><th>제목</th><th>학과</th><th>등록일</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {surveys.map(survey => {
                  const dept = departments.find(d => d.deptCd === survey.ccaId);
                  return (
                    <tr key={survey.cciId}>
                      <td>{survey.cciNm}</td>
                      <td>{dept ? dept.deptNm : ''}</td>
                      <td>{survey.regDt ? new Date(survey.regDt).toLocaleDateString() : ''}</td>
                      <td>
                        <button onClick={() => handleEditSurvey(survey.cciId)}>수정</button>
                        <button onClick={() => handleDeleteSurvey(survey.cciId)}>삭제</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <h4>{isEditing ? '설문 수정' : '신규 설문 등록'}</h4>
          {step === 1 && (
            <div className="step step-1">
              <div className="form-group">
                <label>설문 제목</label>
                <input type="text" value={surveyTitle} onChange={e => setSurveyTitle(e.target.value)} placeholder="설문 제목을 입력하세요" />
              </div>
              <div className="form-group">
                <label>학과 선택</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">-- 학과 선택 --</option>
                  {departments.map(d => <option key={d.deptCd} value={d.deptCd}>{d.deptNm}</option>)}
                </select>
              </div>
              <button onClick={() => { if (!surveyTitle.trim() || !department) { alert('제목과 학과를 모두 입력해주세요.'); return; } setStep(2); }}>다음</button>
            </div>
          )}

          {step === 2 && (
            <div className="step step-2">
              {COMPETENCIES.map(comp => (
                <div key={comp} className="competency-group">
                  <h5>{comp}</h5>
                  {questionsByComp[comp].map(q => (
                    <div key={q.id} className="question-row">
                      <input type="text" value={q.content} onChange={e => handleQuestionChange(comp, q.id, e.target.value)} placeholder={`${comp} 관련 문항을 입력하세요`} />
                      <button className="btn-delete" onClick={() => handleDeleteQuestion(comp, q.id)}>삭제</button>
                    </div>
                  ))}
                  <button className="btn-add" onClick={() => handleAddQuestion(comp)}>문항 추가</button>
                </div>
              ))}
              <div className="step-nav">
                <button className="btn-secondary" onClick={() => setStep(1)}>이전</button>
                {isEditing && <button className="btn-secondary" onClick={handleCancelEdit}>취소</button>}
                <button className="btn-primary" onClick={handleSubmit}>{isEditing ? '수정 완료' : '설문 등록하기'}</button>
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
