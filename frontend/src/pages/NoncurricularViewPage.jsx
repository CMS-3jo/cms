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

    useEffect(() => {
        // 로그인 상태 확인 (토큰 존재 여부로 판단)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setIsLoggedIn(!!token);

        if (prgId) {
            fetchProgramDetail(prgId);
            fetchAllCompetencies();
            fetchMileageInfo(prgId);
            fetchProgramFiles(prgId);
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
            console.log('파일 조회 시작 - prgId:', prgId);
            
            // 첨부파일 조회
            const attachResponse = await fetch(`/api/files/list?refType=NONCUR&refId=${prgId}&category=ATTACH`);
            if (attachResponse.ok) {
                const attachData = await attachResponse.json();
                console.log('첨부파일 조회 결과:', attachData);
                setAttachments(attachData || []);
            }

            // 썸네일 조회
            const thumbResponse = await fetch(`/api/files/list?refType=NONCUR&refId=${prgId}&category=THUMBNAIL`);
            console.log('썸네일 조회 응답 상태:', thumbResponse.status);
            
            if (thumbResponse.ok) {
                const thumbData = await thumbResponse.json();
                console.log('썸네일 조회 결과:', thumbData);
                console.log('썸네일 개수:', thumbData?.length);
                
                if (thumbData && thumbData.length > 0) {
                    console.log('썸네일 설정:', thumbData[0]);
                    console.log('썸네일 fileId:', thumbData[0].fileId);
                    console.log('썸네일 downloadUrl:', thumbData[0].downloadUrl);
                    setThumbnail(thumbData[0]);
                } else {
                    console.log('썸네일 데이터가 비어있음');
                }
            } else {
                console.error('썸네일 조회 실패:', thumbResponse.status, await thumbResponse.text());
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
        setShowApplicationModal(true);
    };

    const handleApplicationSubmit = () => {
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

    // 썸네일 이미지 URL 생성
    const getThumbnailUrl = () => {
        console.log('getThumbnailUrl 호출');
        console.log('thumbnail 전체:', JSON.stringify(thumbnail, null, 2));
        
        if (thumbnail && thumbnail.fileId) {
            const fileId = thumbnail.fileId;
            const url = `/api/files/${fileId}/download`;
            console.log('썸네일 URL 생성 성공:', url, '(fileId:', fileId, ')');
            return url;
        }
        
        console.log('thumbnail이 없거나 fileId가 없음 - 기본 이미지 사용');
        console.log('thumbnail 존재:', !!thumbnail);
        console.log('fileId 존재:', thumbnail?.fileId);
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
                                </div>
                            </div>
                        </div>

                        {/* 프로그램 정보 영역 */}
                        <div className="ncv-info-section">
                            
                            {/* 이미지와 기본정보 */}
                            <div className="ncv-row ncv-mb-4">
                                <div className="ncv-col-lg-4 ncv-mb-3">
                                    <img 
                                        alt="프로그램 이미지" 
                                        className="ncv-image"
                                        src={getThumbnailUrl()}
                                        onLoad={(e) => {
                                            console.log('이미지 로드 성공:', e.target.src);
                                        }}
                                        onError={(e) => {
                                            console.log('이미지 로드 실패:', e.target.src);
                                            e.target.src = "/images/noncur_default.png";
                                        }}
                                    />
                                </div>
                                <div className="ncv-col-lg-8">
                                    <div className="ncv-details-container">
                                        <div className="ncv-details">
                                            <div className="ncv-details-grid">
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">운영부서</span>
                                                    <span className="ncv-detail-value">{programData.deptName}</span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">장소</span>
                                                    <span className="ncv-detail-value">{programData.location || '미정'}</span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">문의처</span>
                                                    <span className="ncv-detail-value">
                                                        {programData.contactEmail || '미정'}<br/>
                                                        {programData.contactPhone || '미정'}
                                                    </span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">교육기간</span>
                                                    <span className="ncv-detail-value">
                                                        {formatDate(programData.prgStDt)} ~ {formatDate(programData.prgEndDt)}
                                                    </span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">신청현황</span>
                                                    <span className="ncv-detail-value">
                                                        {programData.currentApplicants}명 / {programData.maxCnt}명
                                                    </span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">대상</span>
                                                    <span className="ncv-detail-value">
                                                        {programData.targetInfo || '전체'}
                                                    </span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">학과</span>
                                                    <span className="ncv-detail-value">
                                                        {programData.departmentInfo || '전체'}
                                                    </span>
                                                </div>
                                                <div className="ncv-detail-item">
                                                    <span className="ncv-detail-label">학년</span>
                                                    <span className="ncv-detail-value">
                                                        {programData.gradeInfo || '전체'}
                                                    </span>
                                                </div>
                                                {mileageData && mileageData.mlgScore > 0 && (
                                                    <div className="ncv-detail-item">
                                                        <span className="ncv-detail-label">마일리지</span>
                                                        <span className="ncv-detail-value ncv-mileage-value">
                                                            {mileageData.mlgScore}점
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* 신청 버튼 영역 */}
                                        <div className="ncv-action-buttons-section">
                                            <button
                                                onClick={handleApply}
                                                disabled={!isLoggedIn || programData.prgStatCd === '03' || programData.prgStatCd === '05'}
                                                className={`ncv-btn ncv-btn-primary ${!isLoggedIn ? 'ncv-btn-disabled' : ''}`}
                                            >
                                                {!isLoggedIn ? '로그인 후 신청가능' : '신청하기'}
                                            </button>
                                            <button onClick={handleShare} className="ncv-btn ncv-btn-outline-secondary">
                                                공유
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 핵심역량 */}
                            <div className="ncv-competencies-section">
                                <h5 className="ncv-section-title">핵심역량</h5>
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
                                <h5 className="ncv-section-title">프로그램 소개</h5>
                                <div className="ncv-description-content">
                                    {programData.prgDesc || "프로그램 설명이 없습니다."}
                                </div>
                            </div>

                            {/* 프로그램 일정 */}
                            {programData.programSchedule && (
                                <div className="ncv-schedule-section">
                                    <h5 className="ncv-section-title">프로그램 일정</h5>
                                    <div className="ncv-schedule-content">
                                        {programData.programSchedule.split(',').map((item, index) => (
                                            <div key={index} className="ncv-schedule-item">
                                                • {item.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 첨부파일 */}
                            {attachments && attachments.length > 0 && (
                                <div className="ncv-attachments-section">
                                    <h5 className="ncv-section-title">첨부파일</h5>
                                    <div className="ncv-attachments-list">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="ncv-attachment-item"
                                                onClick={() => handleFileDownload(file.fileId, file.fileNmOrig)}
                                            >
                                                <span className="ncv-attachment-icon">📎</span>
                                                <span className="ncv-attachment-name">{file.fileNmOrig}</span>
                                                <span className="ncv-attachment-size">
                                                    {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)}KB` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 신청 버튼 영역 - 제거됨 */}

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