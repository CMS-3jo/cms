import React, { useState, useEffect } from 'react';
import '../../public/css/StudentNoncurMyPageModal.css';

const StudentNoncurMyPageModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('applications');
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [studentData, setStudentData] = useState({
        applications: [],
        completions: [],
        mileage: {
            totalMileage: 0,
            recentHistory: []
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchUserInfo();
        }
    }, [isOpen]);

    useEffect(() => {
        if (userInfo && userInfo.identifierNo) {
            fetchStudentData(userInfo.identifierNo);
        }
    }, [userInfo]);

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const userData = await response.json();
                setUserInfo(userData);
            } else {
                throw new Error('로그인 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error);
            alert('로그인이 필요합니다.');
            onClose();
        }
    };

    const fetchStudentData = async (stdNo) => {
        setLoading(true);
        
        try {
            // 1. 신청 내역 조회
            const applicationsResponse = await fetch(`/api/noncur/applications/${stdNo}`);
            const applications = applicationsResponse.ok ? await applicationsResponse.json() : [];

            // 2. 이수 내역 조회
            const completionsResponse = await fetch(`/api/noncur/completion/student/${stdNo}`);
            const completions = completionsResponse.ok ? await completionsResponse.json() : [];

            // 3. 마일리지 정보 조회
            const mileageResponse = await fetch(`/api/mileage/student/${stdNo}`);
            const mileage = mileageResponse.ok ? await mileageResponse.json() : {
                totalMileage: 0,
                recentHistory: []
            };

            setStudentData({
                applications,
                completions,
                mileage
            });

        } catch (error) {
            console.error('학생 데이터 조회 실패:', error);
            // 목업 데이터로 대체
            setStudentData({
                applications: [
                    {
                        aplyId: 'APLY001',
                        prgId: 'PRG001',
                        prgNm: 'SW역량강화 프로그램',
                        aplyDt: new Date('2025-06-01'),
                        aplyStatCd: '02',
                        aplyStatNm: '승인'
                    },
                    {
                        aplyId: 'APLY002',
                        prgId: 'PRG002',
                        prgNm: '창업 아이디어 경진대회',
                        aplyDt: new Date('2025-06-10'),
                        aplyStatCd: '01',
                        aplyStatNm: '신청완료'
                    }
                ],
                completions: [
                    {
                        cmpId: 'CMP001',
                        prgId: 'PRG001',
                        prgNm: 'SW역량강화 프로그램',
                        cmpDt: new Date('2025-06-15'),
                        cmpStatCd: '02',
                        cmpStatNm: '이수완료',
                        score: 95.5,
                        awardedMileage: 10.0,
                        mileageAwarded: true
                    }
                ],
                mileage: {
                    totalMileage: 25.5,
                    lastUpdatedAt: new Date(),
                    recentHistory: [
                        {
                            mlgId: 'MLG001',
                            prgNm: 'SW역량강화 프로그램',
                            mlgScore: 10.0,
                            mlgDt: new Date('2025-06-15'),
                            mlgAddNm: '가산'
                        },
                        {
                            mlgId: 'MLG002',
                            prgNm: '리더십 워크샵',
                            mlgScore: 15.5,
                            mlgDt: new Date('2025-06-10'),
                            mlgAddNm: '가산'
                        }
                    ]
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (statusCode) => {
        return `status-${statusCode}`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleCancelApplication = async (aplyId, prgId) => {
        if (!confirm('정말 신청을 취소하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/noncur/${prgId}/apply/${userInfo.identifierNo}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('신청이 취소되었습니다.');
                fetchStudentData(userInfo.identifierNo); // 데이터 새로고침
            } else {
                throw new Error('취소 처리에 실패했습니다.');
            }
        } catch (error) {
            alert('취소 처리 중 오류가 발생했습니다: ' + error.message);
        }
    };

    const renderApplicationsTab = () => (
        <div>
            <h4 className="section-title">
                📝 신청 내역 ({studentData.applications.length}개)
            </h4>
            {studentData.applications.length === 0 ? (
                <div className="empty-state">
                    신청한 프로그램이 없습니다.
                </div>
            ) : (
                <div className="card-grid">
                    {studentData.applications.map((application) => (
                        <div key={application.aplyId} className="card">
                            <div className="card-header">
                                <h5 className="card-title">
                                    {application.prgNm || `프로그램 ${application.prgId}`}
                                </h5>
                                <span className={`status-badge ${getStatusBadgeClass(application.aplyStatCd)}`}>
                                    {application.aplyStatNm}
                                </span>
                            </div>
                            <div className="card-footer">
                                <div className="card-date">
                                    신청일: {formatDate(application.aplyDt)}
                                </div>
                                {application.aplyStatCd === '01' && (
                                    <button
                                        onClick={() => handleCancelApplication(application.aplyId, application.prgId)}
                                        className="cancel-button"
                                    >
                                        신청 취소
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCompletionsTab = () => (
        <div>
            <h4 className="section-title">
                🎓 이수 내역 ({studentData.completions.length}개)
            </h4>
            {studentData.completions.length === 0 ? (
                <div className="empty-state">
                    이수 완료한 프로그램이 없습니다.
                </div>
            ) : (
                <div className="card-grid">
                    {studentData.completions.map((completion) => (
                        <div 
                            key={completion.cmpId} 
                            className={`card ${completion.cmpStatCd === '02' ? 'completed' : ''}`}
                        >
                            <div className="card-header">
                                <h5 className="card-title">
                                    {completion.prgNm || `프로그램 ${completion.prgId}`}
                                </h5>
                                <span className={`status-badge ${getStatusBadgeClass(completion.cmpStatCd)}`}>
                                    {completion.cmpStatNm}
                                </span>
                            </div>
                            <div className="completion-details">
                                <div>이수일: {formatDate(completion.cmpDt)}</div>
                                {completion.score && (
                                    <div>점수: {completion.score}점</div>
                                )}
                                {completion.mileageAwarded && (
                                    <div className="mileage-highlight">
                                        ⭐ +{completion.awardedMileage}점
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMileageTab = () => (
        <div>
            <h4 className="section-title">
                ⭐ 마일리지 내역
            </h4>
            
            {/* 마일리지 통계 */}
            <div className="mileage-status-card">
                <div className="mileage-status-header">
                    <h5 className="mileage-status-title">
                        💰 마일리지 현황
                    </h5>
                    <div className="mileage-current-total">
                        {studentData.mileage.totalMileage?.toFixed(1)}점
                    </div>
                </div>
                
                {/* 통계 정보 */}
                <div className="mileage-stats-grid">
                    <div className="mileage-stat-box">
                        <div className="mileage-stat-value">
                            {studentData.completions.filter(c => c.cmpStatCd === '02').length}
                        </div>
                        <div className="mileage-stat-label">
                            이수완료
                        </div>
                    </div>
                    
                    <div className="mileage-stat-box">
                        <div className="mileage-stat-value">
                            {studentData.applications.filter(a => ['01', '02'].includes(a.aplyStatCd)).length}
                        </div>
                        <div className="mileage-stat-label">
                            진행중
                        </div>
                    </div>
                    
                    <div className="mileage-stat-box">
                        <div className="mileage-stat-value">
                            {studentData.mileage.recentHistory?.length || 0}
                        </div>
                        <div className="mileage-stat-label">
                            마일리지 내역
                        </div>
                    </div>
                </div>
                
                <div className="mileage-update-date">
                    마지막 업데이트: {studentData.mileage.lastUpdatedAt ? 
                        formatDate(studentData.mileage.lastUpdatedAt) : '정보 없음'}
                </div>
            </div>

            {/* 마일리지 획득 목표 */}
            <div className="mileage-guide">
                <div className="mileage-guide-header">
                    <span style={{ fontSize: '1.2rem' }}>🎯</span>
                    <h6 className="mileage-guide-title">
                        마일리지 활용 안내
                    </h6>
                </div>
                <div className="mileage-guide-content">
                    • 50점 이상: 우수 학생 포상 대상<br/>
                    • 100점 이상: 장학금 지급 대상<br/>
                    • 150점 이상: 교내 표창 대상
                </div>
            </div>

            {/* 마일리지 히스토리 */}
            {studentData.mileage.recentHistory && studentData.mileage.recentHistory.length > 0 ? (
                <div>
                    <h5 className="mileage-history-header">
                        📋 최근 마일리지 내역
                        <span className="mileage-history-subtitle">
                            (최근 10개)
                        </span>
                    </h5>
                    
                    <div className="mileage-history-list">
                        {studentData.mileage.recentHistory.map((history, index) => (
                            <div
                                key={history.mlgId}
                                className={`mileage-history-item ${index === 0 ? 'latest' : ''} ${
                                    history.mlgAddNm === '가산' ? 'positive' : 'negative'
                                }`}
                            >
                                <div className="mileage-history-header">
                                    <h6 className="mileage-history-program">
                                        {history.prgNm || `프로그램 ${history.prgId}`}
                                    </h6>
                                    <div className="mileage-history-score">
                                        <span className={`mileage-score-value ${
                                            history.mlgAddNm === '가산' ? 'positive' : 'negative'
                                        }`}>
                                            {history.mlgAddNm === '가산' ? '+' : '-'}{history.mlgScore}
                                        </span>
                                        <span className="mileage-score-unit">점</span>
                                    </div>
                                </div>
                                
                                <div className="mileage-history-footer">
                                    <div className="mileage-history-date">
                                        {formatDate(history.mlgDt)}
                                    </div>
                                    <span className={`mileage-type-badge ${
                                        history.mlgAddNm === '가산' ? 'positive' : 'negative'
                                    }`}>
                                        {history.mlgAddNm}
                                    </span>
                                </div>
                                
                                {index === 0 && (
                                    <div className="new-badge">
                                        NEW
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* 더보기 버튼 */}
                    {studentData.mileage.recentHistory.length >= 10 && (
                        <div className="more-button">
                            <button
                                onClick={() => alert('전체 마일리지 내역 페이지로 이동 (추후 구현)')}
                            >
                                전체 내역 보기
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-mileage">
                    <div className="empty-mileage-icon">
                        📊
                    </div>
                    <div className="empty-mileage-title">
                        마일리지 내역이 없습니다
                    </div>
                    <div className="empty-mileage-description">
                        비교과 프로그램을 이수하면 마일리지를 획득할 수 있습니다
                    </div>
                </div>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* 헤더 */}
                <div className="modal-header">
                    <h2 className="modal-title">
                        🎓 {userInfo?.name || '학생'}님의 비교과 활동
                    </h2>
                    <button
                        onClick={onClose}
                        className="close-button"
                    >
                        ×
                    </button>
                </div>

                {/* 마일리지 요약 */}
                <div className="mileage-summary">
                    <div className="mileage-summary-content">
                        <div>
                            <h3 className="mileage-title">
                                🌟 총 누적 마일리지
                            </h3>
                            <div className="mileage-total">
                                {studentData.mileage.totalMileage?.toFixed(1) || '0.0'}
                            </div>
                        </div>
                        <div className="mileage-stats">
                            <div className="mileage-stat-item">
                                이수완료: {studentData.completions.filter(c => c.cmpStatCd === '02').length}개
                            </div>
                            <div className="mileage-stat-item">
                                신청중: {studentData.applications.filter(a => a.aplyStatCd === '01' || a.aplyStatCd === '02').length}개
                            </div>
                        </div>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div className="tab-menu">
                    {[
                        { id: 'applications', label: '신청 내역', icon: '📝' },
                        { id: 'completions', label: '이수 내역', icon: '🎓' },
                        { id: 'mileage', label: '마일리지', icon: '⭐' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* 탭 컨텐츠 */}
                <div className="tab-content">
                    {loading ? (
                        <div className="loading">
                            로딩 중...
                        </div>
                    ) : (
                        <>
                            {activeTab === 'applications' && renderApplicationsTab()}
                            {activeTab === 'completions' && renderCompletionsTab()}
                            {activeTab === 'mileage' && renderMileageTab()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentNoncurMyPageModal;