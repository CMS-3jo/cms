import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '/public/css/NoncurricularView.css';
import ProgramApplicationModal from './ProgramApplicationModal';


const NoncurricularViewPage = () => {
    const { prgId } = useParams();
    
    const [programData, setProgramData] = useState(null);
    const [allCompetencies, setAllCompetencies] = useState([]);
    const [mileageData, setMileageData] = useState(null); // 마일리지 데이터 상태 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);

    useEffect(() => {
        if (prgId) {
            fetchProgramDetail(prgId);
            fetchAllCompetencies();
            fetchMileageInfo(prgId); // 마일리지 정보 조회 추가
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

    // 마일리지 정보 조회 함수 추가
    const fetchMileageInfo = async (prgId) => {
        try {
            const response = await fetch(`/api/mileage/program/${prgId}`);
            if (response.ok) {
                const data = await response.json();
                setMileageData(data);
            } else {
                console.warn('마일리지 정보 조회 실패:', response.status);
                setMileageData({ mlgScore: 0 }); // 기본값
            }
        } catch (err) {
            console.warn('마일리지 정보를 불러오는데 실패했습니다:', err);
            setMileageData({ mlgScore: 0 }); // 기본값
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
                                    // ❌ 카테고리 하드코딩 제거
                                    { label: '운영부서', value: programData.deptName },
                                    { label: '장소', value: programData.location || '미정' },
                                    { label: '연락처', value: `📧 ${programData.contactEmail || '미정'}\n📞 ${programData.contactPhone || '미정'}` },
                                    { label: '대상', value: `대상: ${programData.targetInfo || '전체'}\n학과: ${programData.departmentInfo || '전체'}\n학년: ${programData.gradeInfo || '전체'}` }
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

                        {/* 마일리지 정보 (새로 추가) */}
                        {mileageData && (
                            <div className="noncur-view-section">
                                <h2 className="section-title">
                                    💰 마일리지 정보
                                </h2>
                                <div className="mileage-info" style={{
                                    backgroundColor: '#f8f9fa',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: '#007bff',
                                        marginBottom: '10px'
                                    }}>
                                        {mileageData.mlgScore || 0}점
                                    </div>
                                    <div style={{
                                        color: '#6c757d',
                                        fontSize: '14px'
                                    }}>
                                        이 프로그램을 완료하면 <strong>{mileageData.mlgScore || 0}점</strong>의 마일리지를 획득할 수 있습니다.
                                    </div>
                                </div>
                            </div>
                        )}

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

                        {/* 첨부파일 - 목업 제거, 실제 데이터가 있을 때만 표시 */}
                        {(programData.attachments && programData.attachments.length > 0) && (
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
            <ProgramApplicationModal 
                isOpen={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                programData={programData}
                onSubmit={handleApplicationSubmit}
            />
        </>
    );
};

export default NoncurricularViewPage;