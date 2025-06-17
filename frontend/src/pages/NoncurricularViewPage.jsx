import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '/public/css/NoncurricularView.css';

// 신청 모달 컴포넌트
const ApplicationModal = ({ isOpen, onClose, programData, onSubmit }) => {
    const [formData, setFormData] = useState({
        motivation: '',
        experience: '',
        expectations: '',
        additionalInfo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.motivation.trim()) {
            setError('지원 동기를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 백엔드 DTO에 맞는 데이터 구조로 변환
            const requestData = {
                prgId: programData.prgId,  // 백엔드에서 필수값으로 요구
                stdNo: '', // 이 값은 백엔드에서 JWT 토큰에서 가져와야 할 것 같음
                motivation: formData.motivation,
                expectation: formData.expectations, // expectations -> expectation
                aplySelCd: '01' // 기본값
            };

            console.log('전송 데이터:', requestData); // 디버깅용

            const response = await fetch(`/api/noncur/${programData.prgId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // HttpOnly Cookie 포함
                body: JSON.stringify(requestData)
            });



            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSubmit();
                    onClose();
                }, 2000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || '신청 처리 중 오류가 발생했습니다.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            motivation: '',
            experience: '',
            expectations: '',
            additionalInfo: ''
        });
        setError('');
        setSuccess(false);
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="application-modal-overlay" onClick={handleClose}>
            <div className="application-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="application-modal-header">
                    <h3 className="application-modal-title">
                        📝 프로그램 신청
                    </h3>
                    <button 
                        className="application-modal-close"
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                <div className="application-modal-content">
                    {success ? (
                        <div className="application-success">
                            ✅ 신청이 완료되었습니다! 곧 목록으로 돌아갑니다.
                        </div>
                    ) : (
                        <>
                            <div className="application-form-info">
                                <div className="application-form-info-title">
                                    📋 신청 프로그램 정보
                                </div>
                                <div className="application-form-info-content">
                                    <strong>{programData?.prgNm}</strong><br/>
                                    기간: {new Date(programData?.prgStDt).toLocaleDateString()} ~ {new Date(programData?.prgEndDt).toLocaleDateString()}<br/>
                                    모집인원: {programData?.maxCnt}명 (현재 {programData?.currentApplicants}명 신청)
                                </div>
                            </div>

                            {error && (
                                <div className="application-error">
                                    ❌ {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="application-form-group">
                                    <label className="application-form-label">
                                        지원 동기 <span style={{color: '#dc3545'}}>*</span>
                                    </label>
                                    <textarea
                                        name="motivation"
                                        className="application-form-textarea"
                                        placeholder="이 프로그램에 지원하는 이유를 작성해주세요..."
                                        value={formData.motivation}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="application-form-group">
                                    <label className="application-form-label">
                                        관련 경험 또는 배경
                                    </label>
                                    <textarea
                                        name="experience"
                                        className="application-form-textarea"
                                        placeholder="관련된 경험이나 배경이 있다면 작성해주세요..."
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="application-form-group">
                                    <label className="application-form-label">
                                        프로그램을 통해 얻고자 하는 것
                                    </label>
                                    <textarea
                                        name="expectations"
                                        className="application-form-textarea"
                                        placeholder="이 프로그램을 통해 무엇을 얻고 싶은지 작성해주세요..."
                                        value={formData.expectations}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="application-form-group">
                                    <label className="application-form-label">
                                        추가 정보
                                    </label>
                                    <textarea
                                        name="additionalInfo"
                                        className="application-form-textarea"
                                        placeholder="기타 전달하고 싶은 내용이 있다면 작성해주세요..."
                                        value={formData.additionalInfo}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="application-form-actions">
                                    <button 
                                        type="button"
                                        className="application-btn-cancel"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        취소
                                    </button>
                                    <button 
                                        type="submit"
                                        className="application-btn-submit"
                                        disabled={loading || !formData.motivation.trim()}
                                    >
                                        {loading ? (
                                            <div className="application-loading">
                                                <span>신청 중...</span>
                                            </div>
                                        ) : (
                                            '신청하기'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const NoncurricularViewPage = () => {
    const { prgId } = useParams();
    
    const [programData, setProgramData] = useState(null);
    const [allCompetencies, setAllCompetencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    useEffect(() => {
        if (prgId) {
            fetchProgramDetail(prgId);
            fetchAllCompetencies();
        }
    }, [prgId]);

    const fetchProgramDetail = async (prgId) => {
        try {
            const response = await fetch(`/api/noncur/${prgId}`);
            if (!response.ok) {
                throw new Error('프로그램 정보를 불러오는데 실패했습니다.');
            }
            const data = await response.json();
            setProgramData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCompetencies = async () => {
        try {
            const response = await fetch('/api/noncur/competencies');
            if (response.ok) {
                const data = await response.json();
                setAllCompetencies(data.competencies || []);
            }
        } catch (err) {
            console.error('핵심역량 정보를 불러오는데 실패했습니다:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDDayText = (dDay) => {
        if (dDay > 0) return `D-${dDay}`;
        if (dDay === 0) return 'D-Day';
        return `D+${Math.abs(dDay)}`;
    };

    const handleApply = () => {
        setShowApplicationModal(true);
    };

    const handleApplicationSubmit = () => {
        // 신청 완료 후 프로그램 데이터 새로고침
        if (programData && programData.prgId) {
            fetchProgramDetail(programData.prgId);
        }
        setShowApplicationModal(false);
        alert('신청이 완료되었습니다!');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: programData?.prgNm,
                text: programData?.prgDesc,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('URL이 클립보드에 복사되었습니다.');
        }
    };

    const handleGoBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="loading-container">
                로딩 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2 className="error-title">오류가 발생했습니다</h2>
                <p className="error-message">{error}</p>
                <button onClick={handleGoBack} className="btn-apply">
                    돌아가기
                </button>
            </div>
        );
    }

    if (!programData) {
        return (
            <div className="not-found-container">
                <h2>프로그램을 찾을 수 없습니다</h2>
                <button onClick={handleGoBack} className="btn-apply">
                    돌아가기
                </button>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-view-container">
                    <div className="noncur-view-content">
                        {/* 헤더 영역 */}
                        <div className="noncur-view-header">
                            <div>
                                <h1 className="noncur-view-title">
                                    {programData.prgNm}
                                </h1>
                                <div className="noncur-view-badges">
                                    <span className={`status-badge status-${programData.prgStatCd === '01' ? 'recruiting' :
                                        programData.prgStatCd === '02' ? 'deadline-soon' :
                                        programData.prgStatCd === '03' ? 'closed' :
                                        programData.prgStatCd === '04' ? 'in-progress' : 'completed'}`}>
                                        {programData.prgStatNm}
                                    </span>
                                    {programData.dDay !== undefined && (
                                        <span className="dday-badge">
                                            {getDDayText(programData.dDay)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="noncur-view-actions">
                                <button
                                    onClick={handleApply}
                                    disabled={programData.prgStatCd === '03' || programData.prgStatCd === '05'}
                                    className="btn-apply"
                                >
                                    신청하기
                                </button>
                                <button onClick={handleShare} className="btn-share">
                                    🔗 공유
                                </button>
                            </div>
                        </div>

                        {/* 메인 정보 영역 */}
                        <div className="noncur-view-main">
                            <div>
                                <img 
                                    alt="프로그램 이미지" 
                                    className="noncur-view-image"
                                    src="/images/default-program.jpg"
                                    onError={(e) => {
                                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xODAgMTUwTDE0MCAyMDBIMTgwSDE4MEwyMjAgMjAwTDE4MCAxNTBaIiBmaWxsPSIjQ0REMUQzIi8+Cjwvc3ZnPg==";
                                    }}
                                />
                            </div>
                            
                            <div className="noncur-view-info">
                                {[
                                    { label: '카테고리', value: '카테고리 1' },
                                    { label: '운영부서', value: programData.deptName },
                                    { label: '장소', value: programData.location },
                                    { label: '연락처', value: `📧 ${programData.contactEmail}\n📞 ${programData.contactPhone}` },
                                    { label: '대상', value: `대상: ${programData.targetInfo}\n학과: ${programData.departmentInfo}\n학년: ${programData.gradeInfo}` }
                                ].map((item, index) => (
                                    <div key={index} className="info-item">
                                        <div className="info-label">
                                            {item.label}
                                        </div>
                                        <div className="info-value">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 신청 현황 및 일정 */}
                        <div className="noncur-view-status">
                            <div className="status-item">
                                <span className="status-icon">👥</span>
                                <span>신청 {programData.currentApplicants}명 / 정원 {programData.maxCnt}명</span>
                            </div>
                            
                            <div className="status-item">
                                <span className="status-icon">📅</span>
                                <span>
                                    교육기간: {formatDate(programData.prgStDt)} ~ {formatDate(programData.prgEndDt)}
                                </span>
                            </div>
                        </div>

                        {/* 핵심역량 영역 */}
                        <div className="noncur-view-section">
                            <h2 className="section-title">
                                🎯 핵심역량
                            </h2>
                            <div className="competencies-grid">
                                {allCompetencies.map((competency) => {
                                    const isSelected = programData.competencies?.some(c => c.cciId === competency.cciId);
                                    return (
                                        <div 
                                            key={competency.cciId}
                                            className={`competency-item ${isSelected ? 'competency-selected' : 'competency-unselected'}`}
                                        >
                                            {isSelected && (
                                                <span className="competency-check">
                                                    ✓
                                                </span>
                                            )}
                                            <div className="competency-name">{competency.cciNm}</div>
                                            {competency.cciDesc && (
                                                <div className="competency-desc">
                                                    {competency.cciDesc}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 프로그램 소개 */}
                        <div className="noncur-view-section">
                            <h2 className="section-title">
                                📋 프로그램 소개
                            </h2>
                            <div className="section-content">
                                {programData.prgDesc || "프로그램 설명이 없습니다."}
                            </div>
                        </div>

                        {/* 프로그램 일정 */}
                        {programData.programSchedule && (
                            <div className="noncur-view-section">
                                <h2 className="section-title">
                                    📅 프로그램 일정
                                </h2>
                                <div className="schedule-content">
                                    {programData.programSchedule.split(',').map((item, index) => (
                                        <div key={index} className="schedule-item">
                                            ▶ {item.trim()}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 첨부파일 */}
                        {(programData.attachments && programData.attachments.length > 0) ? (
                            <div className="noncur-view-section">
                                <h2 className="section-title">
                                    📎 첨부파일
                                </h2>
                                <div className="attachments-list">
                                    {programData.attachments.map((file, index) => (
                                        <div key={index} className="attachment-item">
                                            <span className="attachment-icon">📎</span>
                                            <a href="#" className="attachment-link">
                                                {file}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // 파일첨부 기능이 구현되지 않았을 때의 목업
                            <div className="noncur-view-section">
                                <h2 className="section-title">
                                    📎 첨부파일
                                </h2>
                                <div className="attachments-list">
                                    <div className="attachment-item">
                                        <span className="attachment-icon">📎</span>
                                        <a href="#" className="attachment-link">
                                            프로그램 안내서.pdf
                                        </a>
                                    </div>
                                    <div className="attachment-item">
                                        <span className="attachment-icon">📎</span>
                                        <a href="#" className="attachment-link">
                                            참가 신청서.hwp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 돌아가기 버튼 */}
                        <div className="back-button-container">
                            <button onClick={handleGoBack} className="btn-back">
                                목록으로 돌아가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* 신청 모달 */}
            <ApplicationModal 
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                programData={programData}
                onSubmit={handleApplicationSubmit}
            />
        </>
    );
};

export default NoncurricularViewPage;