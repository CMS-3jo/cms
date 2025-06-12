import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const CCARegPage = () => {
    const [surveys, setSurveys] = useState([]); // 기존 설문들 (DB에서 가져올 수도 있음)

    const [surveyTitle, setSurveyTitle] = useState('');
    const [selectedCCA, setSelectedCCA] = useState('');
    const [questions, setQuestions] = useState([{ id: 1, content: '' }]);

    const [isEditMode, setIsEditMode] = useState(false);
    const [editSurveyId, setEditSurveyId] = useState(null);

    const handleAddQuestion = () => {
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        setQuestions([...questions, { id: newId, content: '' }]);
    };

    const handleQuestionChange = (id, value) => {
        const updatedQuestions = questions.map(q =>
            q.id === id ? { ...q, content: value } : q
        );
        setQuestions(updatedQuestions);
    };

    const handleDeleteQuestion = (id) => {
        const updatedQuestions = questions.filter(q => q.id !== id);
        setQuestions(updatedQuestions);
    };

    const handleSubmit = () => {
        if (isEditMode) {
            // 수정모드 → 기존 설문 수정
            const updatedSurveys = surveys.map(survey =>
                survey.id === editSurveyId
                    ? {
                        ...survey,
                        title: surveyTitle,
                        cciId: selectedCCA,
                        questions: [...questions]
                    }
                    : survey
            );
            setSurveys(updatedSurveys);
            alert('설문이 수정되었습니다.');
        } else {
            // 새로 등록
            const newSurvey = {
                id: Date.now(), // 간단한 고유 ID
                title: surveyTitle,
                cciId: selectedCCA,
                questions: [...questions],
                regDate: new Date().toISOString().split('T')[0]
            };
            setSurveys([...surveys, newSurvey]);
            alert('설문이 등록되었습니다.');
        }

        // 폼 초기화
        resetForm();
    };

    const resetForm = () => {
        setSurveyTitle('');
        setSelectedCCA('');
        setQuestions([{ id: 1, content: '' }]);
        setIsEditMode(false);
        setEditSurveyId(null);
    };

    const handleEditSurvey = (survey) => {
        setSurveyTitle(survey.title);
        setSelectedCCA(survey.cciId);
        setQuestions(survey.questions);
        setIsEditMode(true);
        setEditSurveyId(survey.id);
    };

    const handleDeleteSurvey = (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            const updatedSurveys = surveys.filter(survey => survey.id !== id);
            setSurveys(updatedSurveys);
        }
    };

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">

                    <h4>기존 설문 목록</h4>
                    {surveys.length === 0 ? (
                        <p>등록된 설문이 없습니다.</p>
                    ) : (
                        <ul className='survey-list'>
                            {surveys.map((survey) => (
                                <li key={survey.id} style={{ marginBottom: '10px' }}>
                                    <strong>{survey.title}</strong> ({survey.cciId}) - 등록일: {survey.regDate}{' '}
                                    <button type='button'
                                        className='edit-button'
                                        onClick={() => handleEditSurvey(survey)}
                                    >
                                        수정
                                    </button>
                                    <button type='button'
                                        className='delete-button'
                                        onClick={() => handleDeleteSurvey(survey.id)}
                                    >
                                        삭제
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h4 style={{ marginTop: '30px' }}>
                        {isEditMode ? '설문 수정' : '핵심역량 설문 등록'}
                    </h4>

                    {/* 설문 제목 */}
                    <div className="form-group">
                        <label htmlFor="survey_title">설문 제목</label>
                        <input
                            type="text"
                            id="survey_title"
                            className="noncur-search-input"
                            placeholder="설문 제목을 입력하세요."
                            value={surveyTitle}
                            onChange={(e) => setSurveyTitle(e.target.value)}
                        />
                    </div>

                    {/* 역량 선택 */}
                    <div className="form-group">
                        <label htmlFor="cci_id">핵심역량 선택</label>
                        <select
                            id="cci_id"
                            className="noncur-select"
                            value={selectedCCA}
                            onChange={(e) => setSelectedCCA(e.target.value)}
                        >
                            <option value="">선택하세요</option>
                            <option value="의사소통">의사소통</option>
                            <option value="문제해결">문제해결</option>
                            <option value="자기관리">자기관리</option>
                            <option value="대인관계">대인관계</option>
                            <option value="글로벌역량">글로벌역량</option>
                            <option value="직업윤리">직업윤리</option>
                        </select>
                    </div>

                    {/* 문항 리스트 */}
                    <div className="survey-question-list">
                        {questions.map((q) => (
                            <div key={q.id} className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <label style={{ marginRight: '10px', minWidth: '60px' }}>문항 {q.id}</label>
                                <input
                                    type="text"
                                    className="noncur-search-input"
                                    placeholder={`문항 ${q.id} 내용을 입력하세요.`}
                                    value={q.content}
                                    onChange={(e) =>
                                        handleQuestionChange(q.id, e.target.value)
                                    }
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        marginLeft: '10px',
                                        padding: '6px 10px',
                                        backgroundColor: '#ff4d4f',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleDeleteQuestion(q.id)}
                                >
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* 문항 추가 버튼 */}
                    <div className="form-group">
                        <button
                            type="button"
                            className="cca-list-item-button"
                            onClick={handleAddQuestion}
                        >
                            문항 추가하기
                        </button>
                    </div>

                    {/* 설문 등록/수정 버튼 */}
                    <div className="form-group">
                        <button
                            type="button"
                            className="cca-list-item-button"
                            onClick={handleSubmit}
                        >
                            {isEditMode ? '설문 수정 완료' : '설문 등록하기'}
                        </button>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
};

export default CCARegPage;
