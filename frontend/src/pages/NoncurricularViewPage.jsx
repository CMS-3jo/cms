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
    const [mileageData, setMileageData] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasApplied, setHasApplied] = useState(false); // 신청 여부 상태 추가
    const [applicationData, setApplicationData] = useState(null); // 신청 데이터 전체 저장

    // 사용자의 신청 목록 조회하여 현재 프로그램 신청 여부 확인
    const checkApplicationStatus = async () => {
        if (!isLoggedIn || !prgId) return;
        try {
            const response = await fetch('/api/noncur/applications/my');
            if (response.ok) {
                const applications = await response.json();
                // 현재 프로그램에 대한 신청 찾기
                const currentApplication = applications.find(app => app.prgId === prgId);
                if (currentApplication) {
                    setHasApplied(true);
                    setApplicationData(currentApplication);
                } else {
                    setHasApplied(false);
                    setApplicationData(null);
                }
            }
        } catch (error) {
            console.error('신청 상태 확인 중 오류 발생:', error);
        }
    };

    useEffect(() => {
        // 간단한 로그인 상태 확인
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' });
                setIsLoggedIn(response.ok);
            } catch {
                setIsLoggedIn(false);
            }
        };
        
        checkAuth();

        if (prgId) {
            fetchProgramDetail(prgId);
            fetchAllCompetencies();
            fetchMileageInfo(prgId);
            fetchProgramFiles(prgId);
        }
    }, [prgId]);

    // 로그인 상태가 변경되면 신청 상태 확인
    useEffect(() => {
        if (isLoggedIn && prgId) {
            checkApplicationStatus();
        }
    }, [isLoggedIn, prgId]);

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

    const fetchMileageInfo = async (prgId) => {
        try {
            const response = await fetch(`/api/mileage/program/${prgId}`);
            if (response.ok) {
                const data = await response.json();
                setMileageData(data);
            } else {
                console.warn('마일리지 정보 조회 실패:', response.status);
                setMileageData({ mlgScore: 0 });
            }
        } catch (err) {
            console.warn('마일리지 정보를 불러오는데 실패했습니다:', err);
            setMileageData({ mlgScore: 0 });
        }
    };

    // 파일 목록 조회
    const fetchProgramFiles = async (prgId) => {
        try {
            // 첨부파일 조회
            const attachResponse = await fetch(`/api/files/list?refType=NONCUR&refId=${prgId}&category=ATTACH`);
            if (attachResponse.ok) {
                const attachData = await attachResponse.json();
                setAttachments(attachData || []);
            }

            // 썸네일 조회
            const thumbResponse = await fetch(`/api/files/list?refType=NONCUR&refId=${prgId}&category=THUMBNAIL`);
            if (thumbResponse.ok) {
                const thumbData = await thumbResponse.json();
                if (thumbData && thumbData.length > 0) {
                    setThumbnail(thumbData[0]);
                }
            }
        } catch (err) {
            console.error('파일 정보를 불러오는데 실패했습니다:', err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getDDayText = (dDay) => {
        if (dDay > 0) return `D-${dDay}`;
        if (dDay === 0) return 'D-Day';
        return `D+${Math.abs(dDay)}`;
    };

    const handleApply = () => {
        if (!isLoggedIn) {
            alert('로그인이 필요한 서비스입니다.');
            return;
        }
        // 거부나 취소 상태가 아닌 경우 재신청 불가
        if (hasApplied && applicationData && !['03', '04'].includes(applicationData.aplyStatCd)) {
            alert('이미 신청한 프로그램입니다.');
            return;
        }
        setShowApplicationModal(true);
    };

    const handleApplicationSubmit = () => {
        if (programData && programData.prgId) {
            fetchProgramDetail(programData.prgId);
            // 신청 후 상태 다시 확인
            checkApplicationStatus();
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

    // 파일 다운로드 핸들러
    const handleFileDownload = (fileId, fileName) => {
        const downloadUrl = `/api/files/${fileId}/download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 신청 상태별 버튼 설정을 가져오는 함수
    const getApplicationButtonConfig = (applicationStatus) => {
        const statusConfigs = {
            '01': { // 신청완료
                text: '신청완료',
                className: 'ncv-btn-success',
                disabled: true
            },
            '02': { // 승인
                text: '승인완료',
                className: 'ncv-btn-approved',
                disabled: true
            },
            '03': { // 거부
                text: '신청거부',
                className: 'ncv-btn-rejected',
                disabled: true,
                allowReapply: true // 재신청 가능
            },
            '04': { // 취소
                text: '신청취소',
                className: 'ncv-btn-cancelled',
                disabled: true,
                allowReapply: true // 재신청 가능
            },
            '05': { // 이수완료
                text: '이수완료',
                className: 'ncv-btn-completed',
                disabled: true
            }
        };
        return statusConfigs[applicationStatus] || {
            text: '신청완료',
            className: 'ncv-btn-success',
            disabled: true
        };
    };

    // 버튼 텍스트와 상태를 결정하는 함수
    const getButtonConfig = () => {
        if (!isLoggedIn) {
            return {
                text: '로그인 후 신청가능',
                disabled: true,
                className: 'ncv-btn-disabled'
            };
        }
        if (hasApplied && applicationData) {
            const appConfig = getApplicationButtonConfig(applicationData.aplyStatCd);
            // 거부나 취소 상태에서는 프로그램이 아직 신청 가능한 상태라면 재신청 허용
            if (appConfig.allowReapply && !['03', '04', '05'].includes(programData?.prgStatCd)) {
                return {
                    text: `${appConfig.text} - 재신청가능`,
                    disabled: false,
                    className: 'ncv-btn-reapply'
                };
            }
            return {
                text: appConfig.text,
                disabled: appConfig.disabled,
                className: appConfig.className
            };
        }
        if (['03', '04', '05'].includes(programData?.prgStatCd)) {
            return {
                text: '신청불가',
                disabled: true,
                className: 'ncv-btn-disabled'
            };
        }
        return {
            text: '신청하기',
            disabled: false,
            className: ''
        };
    };

    // 썸네일 이미지 URL 생성
    const getThumbnailUrl = () => {
        if (thumbnail && thumbnail.fileId) {
            return `/api/files/${thumbnail.fileId}/download`;
        }
        return "/images/noncur_default.png";
    };

    if (loading) {
        return (
            <div className="ncv-loading-container">
                <div className="ncv-loading-spinner" role="status">
                    <span className="ncv-loading-text">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="ncv-error-container">
                <div className="ncv-error-alert">
                    <h4>오류가 발생했습니다</h4>
                    <p>{error}</p>
                    <button onClick={handleGoBack} className="ncv-btn ncv-btn-secondary">
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!programData) {
        return (
            <div className="ncv-error-container">
                <div className="ncv-error-alert">
                    <h4>프로그램을 찾을 수 없습니다</h4>
                    <button onClick={handleGoBack} className="ncv-btn ncv-btn-secondary">
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const buttonConfig = getButtonConfig();

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="ncv-container">
                    <div className="ncv-content-wrapper">
                        
                        {/* 프로그램 제목과 상태 */}
                        <div className="ncv-title-section">
                            <div className="ncv-title-row">
                                <h1 className="ncv-title">{programData.prgNm}</h1>
                                <div className="ncv-title-badges">
                                    <span className={`ncv-badge ${
                                        programData.prgStatCd === '01' ? 'ncv-badge-success' :
                                        programData.prgStatCd === '02' ? 'ncv-badge-warning' :
                                        programData.prgStatCd === '03' ? 'ncv-badge-danger' :
                                        programData.prgStatCd === '04' ? 'ncv-badge-info' : 'ncv-badge-secondary'
                                    }`}>
                                        {programData.prgStatNm}
                                    </span>
                                    {programData.dDay !== undefined && (
                                        <span className="ncv-badge ncv-badge-primary">
                                            {getDDayText(programData.dDay)}
                                        </span>
                                    )}
                                    {/* 신청 완료 상태 표시 */}
                                    {hasApplied && applicationData && (
                                        <span className={`ncv-badge ${
                                            applicationData.aplyStatCd === '01' ? 'ncv-badge-info' : // 신청완료
                                            applicationData.aplyStatCd === '02' ? 'ncv-badge-success' : // 승인
                                            applicationData.aplyStatCd === '03' ? 'ncv-badge-danger' : // 거부
                                            applicationData.aplyStatCd === '04' ? 'ncv-badge-warning' : // 취소
                                            applicationData.aplyStatCd === '05' ? 'ncv-badge-primary' : // 이수완료
                                            'ncv-badge-secondary'
                                        }`}>
                                            {applicationData.aplyStatNm}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 프로그램 정보 영역 */}
                        <div className="ncv-info-section">
                            
                            {/* 이미지와 기본정보 */}
                            <div className="ncv-row ncv-mb-4">
                                <div className="ncv-col-lg-5 ncv-mb-3">
                                    <img 
                                        alt="프로그램 이미지" 
                                        className="ncv-image"
                                        src={getThumbnailUrl()}
                                        onError={(e) => {
                                            e.target.src = "/images/noncur_default.png";
                                        }}
                                    />
                                </div>
                                <div className="ncv-col-lg-7">
                                    <div className="ncv-details-container">
                                        
                                        {/* 문의처와 모집조건을 좌우 배치 */}
                                        <div className="ncv-info-groups-row">
                                            {/* 문의처 영역 */}
                                            <div className="ncv-info-group ncv-info-group-left">
                                                <h6 className="ncv-info-group-title">
                                                    <i className="bi bi-telephone-fill"></i> 문의처
                                                </h6>
                                                <div className="ncv-info-group-content">
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-envelope"></i> 이메일
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.contactEmail || '미정'}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-phone"></i> 전화번호
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.contactPhone || '미정'}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-building"></i> 운영부서
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.deptName}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-geo-alt"></i> 장소
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.location || '미정'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 모집조건 영역 */}
                                            <div className="ncv-info-group ncv-info-group-right">
                                                <h6 className="ncv-info-group-title">
                                                    <i className="bi bi-bullseye"></i> 모집조건
                                                </h6>
                                                <div className="ncv-info-group-content">
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-people"></i> 대상
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.targetInfo || '전체'}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-mortarboard"></i> 학과
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.departmentInfo || '전체'}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-bookmark"></i> 학년
                                                        </span>
                                                        <span className="ncv-detail-value">{programData.gradeInfo || '전체'}</span>
                                                    </div>
                                                    <div className="ncv-detail-row">
                                                        <span className="ncv-detail-label">
                                                            <i className="bi bi-calendar-range"></i> 교육기간
                                                        </span>
                                                        <span className="ncv-detail-value">
                                                            {formatDate(programData.prgStDt)} ~ {formatDate(programData.prgEndDt)}
                                                        </span>
                                                    </div>
                           
                                                </div>
                                            </div>
                                        </div>
                                        
                                                                 {mileageData && mileageData.mlgScore > 0 && (
                                                        <div className="ncv-detail-row">
                                                            <span className="ncv-detail-label">
                                                                <i className="bi bi-coin"></i> 마일리지
                                                            </span>
                                                            <span className="ncv-detail-value ncv-mileage-value">
                                                                {mileageData.mlgScore}점
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                        {/* 신청 영역 */}
                                        <div className="ncv-application-area">
                                            <div className="ncv-application-status">
                                                <span className="ncv-application-label">신청현황</span>
                                                <span className="ncv-application-count">
                                                    <strong>{programData.currentApplicants}명</strong> / {programData.maxCnt}명
                                                </span>
                                            </div>
                                            <div className="ncv-application-actions">
                                                <button
                                                    onClick={handleApply}
                                                    disabled={buttonConfig.disabled}
                                                    className={`ncv-btn ncv-btn-primary ncv-btn-apply ${buttonConfig.className}`}
                                                >
                                                    {buttonConfig.text}
                                                </button>
                                                <button onClick={handleShare} className="ncv-btn ncv-btn-share" title="공유">
                                                    <i className="bi bi-share"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 핵심역량 */}
                            <div className="ncv-competencies-section">
                                <h5 className="ncv-section-title">
                                    <i className="bi bi-award"></i> 핵심역량
                                </h5>
                                <div className="ncv-competencies-list">
                                    {allCompetencies.map((competency) => {
                                        const isSelected = programData.competencies?.some(c => c.cciId === competency.cciId);
                                        return (
                                            <span 
                                                key={competency.cciId}
                                                className={`ncv-competency-badge ${isSelected ? 'ncv-competency-selected' : ''}`}
                                            >
                                                {competency.cciNm}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 프로그램 소개 */}
                            <div className="ncv-description-section">
                                <h5 className="ncv-section-title">
                                    <i className="bi bi-file-text"></i> 프로그램 소개
                                </h5>
                                <div className="ncv-description-content">
                                    {programData.prgDesc || "프로그램 설명이 없습니다."}
                                </div>
                            </div>

                            {/* 프로그램 일정 */}
                            {programData.programSchedule && (
                                <div className="ncv-schedule-section">
                                    <h5 className="ncv-section-title">
                                        <i className="bi bi-calendar-check"></i> 프로그램 일정
                                    </h5>
                                    <div className="ncv-schedule-content">
                                        {programData.programSchedule.split(',').map((item, index) => (
                                            <div key={index} className="ncv-schedule-item">
                                                <i className="bi bi-dot"></i> {item.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 첨부파일 */}
                            {attachments && attachments.length > 0 && (
                                <div className="ncv-attachments-section">
                                    <h5 className="ncv-section-title">
                                        <i className="bi bi-paperclip"></i> 첨부파일
                                    </h5>
                                    <div className="ncv-attachments-list">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="ncv-attachment-item"
                                                onClick={() => handleFileDownload(file.fileId, file.fileNmOrig)}
                                            >
                                                <span className="ncv-attachment-icon">
                                                    <i className="bi bi-file-earmark"></i>
                                                </span>
                                                <span className="ncv-attachment-name">{file.fileNmOrig}</span>
                                                <span className="ncv-attachment-size">
                                                    {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)}KB` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* 돌아가기 버튼 */}
                        <div className="ncv-back-section">
                            <button onClick={handleGoBack} className="ncv-btn ncv-btn-outline-secondary">
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