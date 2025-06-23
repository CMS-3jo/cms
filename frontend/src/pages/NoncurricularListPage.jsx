import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import StudentNoncurMyPageModal from './StudentNoncurMyPageModal';
import '/public/css/NoncurricularList.css';

const NoncurricularListPage = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [programMileages, setProgramMileages] = useState({});
    const [showMyPageModal, setShowMyPageModal] = useState(false);
    const [programThumbnails, setProgramThumbnails] = useState({});

    // ⭐ 1. 로그인 상태 저장을 위한 state 추가
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // userRole state는 원래 코드에 있었으므로 유지합니다.
    const [userRole, setUserRole] = useState(null);

    const [pagination, setPagination] = useState({
        totalElements: 0, totalPages: 1, currentPage: 0, size: 8,
        hasNext: false, hasPrevious: false, isFirst: true, isLast: true
    });

    const [searchParams, setSearchParams] = useState({
        keyword: '', searchDeptCode: '', searchStatusCode: '',
        page: 0, size: 8, sortBy: 'regDt', sortDir: 'desc'
    });

    const [debouncedKeyword, setDebouncedKeyword] = useState(searchParams.keyword);

    //================================================================
    // 핸들러 및 유틸리티 함수 (사용자 코드 원본 유지)
    //================================================================

    const handleProgramClick = (prgId) => navigate(`/noncur/${prgId}`);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setSearchParams(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value, page: 0 }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '');
    };

    /**
     * D-Day 계산 함수 (원본 코드 그대로 유지)
     */
    const calculateDDay = (program) => {
        let dDay, prgStatCd, startDate;
        
        if (typeof program === 'object' && program.dDay !== undefined) {
            dDay = program.dDay;
            prgStatCd = program.prgStatCd;
        } else {
            startDate = program;
            if (!startDate) return { text: '', class: '' };
            
            const today = new Date(); 
            today.setHours(0, 0, 0, 0);
            const start = new Date(startDate); 
            start.setHours(0, 0, 0, 0);
            
            if (today >= start) return { text: '모집마감', class: 'dday-ended' };
            
            const diffDays = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
            dDay = diffDays;
        }
        
        if (dDay === -999) return { text: '종료', class: 'dday-ended' };
        if (dDay === -888) return { text: '운영중', class: 'dday-progress' };
        if (dDay === -777) return { text: '모집완료', class: 'dday-closed' };
        
        if (dDay < 0) return { text: '모집마감', class: 'dday-ended' };
        if (dDay === 0) return { text: 'D-DAY', class: 'dday-today' };
        if (dDay <= 3) return { text: `D-${dDay}`, class: 'dday-urgent' };
        if (dDay <= 7) return { text: `D-${dDay}`, class: 'dday-soon' };
        return { text: `D-${dDay}`, class: 'dday-normal' };
    };

    const getStatusInfo = (statusCode) => {
        const statusMap = {
            '01': { text: '모집중', class: 'status-recruiting' },
            '02': { text: '마감임박', class: 'status-urgent' },
            '03': { text: '모집완료', class: 'status-finished' },
            '04': { text: '운영중', class: 'status-ongoing' },
            '05': { text: '종료', class: 'status-ended' }
        };
        return statusMap[statusCode] || { text: '알수없음', class: 'status-ended' };
    };

    const getThumbnailUrl = (prgId) => {
        const thumbnail = programThumbnails[prgId];
        if (thumbnail) {
            return `/api/files/${thumbnail.fileId}/download`;
        }
        return "/images/noncur_default.png";
    };

    //================================================================
    // 데이터 로딩 (Side Effects)
    //================================================================

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedKeyword(searchParams.keyword), 500);
        return () => clearTimeout(timer);
    }, [searchParams.keyword]);

    // ⭐ 2. 로그인 확인을 위한 함수 (기존 checkUserRole은 제거)
    const checkLoginStatus = async () => {
        try {
            const response = await fetch('/api/auth/me');
            setIsLoggedIn(response.ok);
            // 로그인 상태가 OK이면 사용자 정보도 가져와서 userRole을 설정할 수 있습니다.
            if(response.ok) {
                const userData = await response.json();
                setUserRole(userData.role);
            }
        } catch (error) {
            console.error('로그인 상태 확인 중 오류 발생:', error);
            setIsLoggedIn(false);
        }
    };
    
    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(true);
            setError(null);

            const apiParams = { ...searchParams, keyword: debouncedKeyword };
            const queryParams = new URLSearchParams();

            Object.entries(apiParams).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            try {
                const response = await fetch(`/api/noncur?${queryParams}`);
                if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');

                const data = await response.json();
                const programList = data.programs || [];
                setPrograms(programList);
                setPagination(data);

                if (programList.length > 0) {
                    const mileagePromises = programList.map(async (p) => {
                        try {
                            const res = await fetch(`/api/mileage/program/${p.prgId}`);
                            if (res.ok) {
                                const mData = await res.json();
                                return { prgId: p.prgId, mileage: mData.mlgScore || 0 };
                            }
                        } catch (e) { /* 무시 */ }
                        return { prgId: p.prgId, mileage: 0 };
                    });

                     const thumbnailPromises = programList.map(async (p) => {
                        try {
                            const res = await fetch(`/api/files/list?refType=NONCUR&refId=${p.prgId}&category=THUMBNAIL`);
                            if (res.ok) {
                                const thumbData = await res.json();
                                if (thumbData && thumbData.length > 0) {
                                    return { prgId: p.prgId, thumbnail: thumbData[0] };
                                }
                            }
                        } catch (e) { /* 무시 */ }
                        return { prgId: p.prgId, thumbnail: null };
                    });
    
                    const thumbnailResults = await Promise.all(thumbnailPromises);
                    const thumbnailMap = thumbnailResults.reduce((acc, cur) => ({ ...acc, [cur.prgId]: cur.thumbnail }), {});
                    setProgramThumbnails(thumbnailMap);

                    const mileageResults = await Promise.all(mileagePromises);
                    setProgramMileages(mileageResults.reduce((acc, cur) => ({ ...acc, [cur.prgId]: cur.mileage }), {}));
                } else {
                    setProgramMileages({});
                }

            } catch (err) {
                setError(err.message);
                console.error('프로그램 목록 조회 실패: ', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrograms();
        // ⭐ 3. 기존 checkUserRole 대신 checkLoginStatus 호출
        checkLoginStatus(); 
    }, [debouncedKeyword, searchParams]); // useEffect 의존성 배열 원본 유지

    //================================================================
    // 렌더링
    //================================================================
    
    const renderPaginationButtons = () => {
        const buttons = [];
        const { currentPage, totalPages } = pagination;
        if (!totalPages) return null;

        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        buttons.push(<button key="prev" className="btn btn-outline-primary btn-sm" disabled={pagination.isFirst} onClick={() => handlePageChange(currentPage - 1)}>이전</button>);
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(<button key={i} className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handlePageChange(i)}>{i + 1}</button>);
        }
        buttons.push(<button key="next" className="btn btn-outline-primary btn-sm" disabled={pagination.isLast} onClick={() => handlePageChange(currentPage + 1)}>다음</button>);
        return buttons;
    };

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="page-container container-fluid">
                    <div className="page-header">
                        <h4 className="page-title">비교과 프로그램</h4>
                        {/* ⭐ 4. isLoggedIn state를 사용하여 버튼을 조건부 렌더링 */}
                        {isLoggedIn && (
                            <button onClick={() => setShowMyPageModal(true)} className="my-page-button">
                                <i className="bi bi-person-check-fill"></i>
                                <span>내 비교과 활동</span>
                            </button>
                        )}
                    </div>
                    <div className="filter-bar">
                        <select
                            name="searchStatusCode"
                            className="status-filter"
                            value={searchParams.searchStatusCode}
                            onChange={handleFilterChange}
                        >
                            <option value="">전체 상태</option>
                            <option value="01">모집중</option>
                            <option value="02">마감임박</option>
                            <option value="03">모집완료</option>
                            <option value="04">운영중</option>
                            <option value="05">종료</option>
                        </select>
                        <input
                            type="text"
                            name="keyword"
                            placeholder="프로그램명으로 검색"
                            value={searchParams.keyword}
                            onChange={handleFilterChange}
                            className="search-input"
                        />
                        <button className="search-button">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                    <div className="result-info">
                        {typeof pagination.totalElements === 'number' &&
                            <span>총 <strong>{pagination.totalElements}</strong>개의 프로그램</span>
                        }
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger text-center" role="alert">
                            <h4 className="alert-heading">오류가 발생했습니다</h4>
                            <p>{error}</p>
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="no-results">
                            <i className="bi bi-emoji-frown"></i>
                            <h5>결과 없음</h5>
                            <p>해당 조건의 프로그램이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="program-grid">
                            {programs.map((program) => {
                                const statusInfo = getStatusInfo(program.prgStatCd);
                                
                                const ddayInfo = program.dDay !== undefined ? 
                                    calculateDDay(program) : 
                                    calculateDDay(program.prgStDt);
        
                                return (
                                    <div key={program.prgId} className="program-card" onClick={() => handleProgramClick(program.prgId)}>
                                        <div className="card-image-container">
                                            <img 
                                                src={getThumbnailUrl(program.prgId)} 
                                                alt={program.prgNm} 
                                                className="card-image" 
                                                onError={(e) => { e.target.src = "/images/noncur_default.png"; }} 
                                            />
                                            {ddayInfo.text && (
                                                <span className={`dday-badge ${ddayInfo.class}`}>
                                                    {ddayInfo.text}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <div className="card-tags">
                                                <span className={`status-badge ${statusInfo.class}`}>
                                                    {statusInfo.text}
                                                </span>
                                                <span className="mileage-badge">
                                                    <i className="bi bi-gem"></i> {programMileages[program.prgId] || 0}
                                                </span>
                                            </div>
                                            <h6 className="card-title">{program.prgNm}</h6>
                                            <p className="card-dept">{program.deptName || program.deptNm || '운영부서 미지정'}</p>
                                            <div className="card-footer">
                                                <span>
                                                    <i className="bi bi-calendar-check"></i> 
                                                    {formatDate(program.prgStDt)} ~ {formatDate(program.prgEndDt)}
                                                </span>
                                                <span>
                                                    <i className="bi bi-people"></i> {program.maxCnt || 'N'}명
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {pagination.totalPages > 1 && !loading && (
                        <div className="pagination-container">
                            <div className="btn-group" role="group">
                                {renderPaginationButtons()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <StudentNoncurMyPageModal isOpen={showMyPageModal} onClose={() => setShowMyPageModal(false)} />
        </>
    );
};

export default NoncurricularListPage;