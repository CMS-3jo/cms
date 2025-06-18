//비교과 리스트 페이지
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import StudentNoncurMyPageModal from './StudentNoncurMyPageModal'; // 실제 경로로 수정

import '/public/css/NoncurricularList.css';

const NoncurricularListPage = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debouncedSearchParams, setDebouncedSearchParams] = useState(null);
    const [showMyPageModal, setShowMyPageModal] = useState(false);
    const [programMileages, setProgramMileages] = useState({}); // 마일리지 데이터 저장
    
    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 0,
        hasNext: false,
        hasPrevious: false,
        isFirst: true,
        isLast: false
    });
    
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        searchDeptCode: '',
        searchStatusCode: '',
        page: 0,
        size: 8,
        sortBy: 'regDt',
        sortDir: 'desc'
    });

    const handleProgramClick = (prgId) => {
        navigate(`/noncur/${prgId}`);
    };

    // 디바운싱: 검색어 변경 후 500ms 대기
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchParams(searchParams);
        }, searchParams.keyword ? 500 : 0);

        return () => clearTimeout(timer);
    }, [searchParams]);

    // 마일리지 정보 조회 함수
    const fetchProgramMileages = async (programList) => {
        const mileagePromises = programList.map(async (program) => {
            try {
                const response = await fetch(`/api/mileage/program/${program.prgId}`);
                if (response.ok) {
                    const mileageData = await response.json();
                    return { prgId: program.prgId, mileage: mileageData.mlgScore || 0 };
                }
                return { prgId: program.prgId, mileage: 0 };
            } catch (error) {
                console.error(`마일리지 조회 실패 (${program.prgId}):`, error);
                return { prgId: program.prgId, mileage: 0 };
            }
        });

        const mileageResults = await Promise.all(mileagePromises);
        const mileageMap = {};
        mileageResults.forEach(result => {
            mileageMap[result.prgId] = result.mileage;
        });
        setProgramMileages(mileageMap);
    };

    const fetchPrograms = useCallback(async () => {
        if (!debouncedSearchParams) return;
        
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            Object.entries(debouncedSearchParams).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    queryParams.append(key, value);
                }
            });
            
            const response = await fetch(`/api/noncur?${queryParams}`);

            if (!response.ok) {
                throw new Error('데이터를 불러오는데 실패했습니다.');
            }
            
            const data = await response.json();
            
            console.log('백엔드 응답:', data);
            
            // 백엔드 응답 구조에 맞게 처리
            if (data.content && data.pagination) {
                setPrograms(data.content);
                setPagination({
                    totalElements: data.pagination.totalElements,
                    totalPages: data.pagination.totalPages,
                    currentPage: data.pagination.page,
                    size: data.pagination.size,
                    hasNext: data.pagination.hasNext,
                    hasPrevious: data.pagination.hasPrevious,
                    isFirst: data.pagination.isFirst,
                    isLast: data.pagination.isLast
                });
                // 마일리지 정보 조회
                await fetchProgramMileages(data.content);
            } else if (Array.isArray(data)) {
                console.log('배열 형태 응답 감지 - 페이지네이션 정보 없음');
                setPrograms(data);
                await fetchProgramMileages(data);
            } else {
                if (data.programs) {
                    setPrograms(data.programs);
                    setPagination({
                        totalElements: data.totalElements || 0,
                        totalPages: data.totalPages || 1,
                        currentPage: data.currentPage || 0,
                        size: data.size || 8,
                        hasNext: data.hasNext || false,
                        hasPrevious: data.hasPrevious || false,
                        isFirst: data.isFirst !== false,
                        isLast: data.isLast !== false
                    });
                    // 마일리지 정보 조회
                    await fetchProgramMileages(data.programs);
                } else {
                    console.log('알 수 없는 응답 구조:', data);
                    setPrograms(data || []);
                }
            }

        } catch (err) {
            setError(err.message);
            console.error('프로그램 목록 조회 실패: ', err);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearchParams]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    // 초기 로딩
    useEffect(() => {
        setDebouncedSearchParams(searchParams);
    }, []);

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setSearchParams(prev => ({
                ...prev,
                page: newPage
            }));
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short'
        }).replace(/\./g, '.').replace(/\s/g, '');
    };

    // D-day 계산 함수
    const calculateDDay = (endDate) => {
        if (!endDate) return '';
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return '종료';
        if (diffDays === 0) return 'D-Day';
        return `D-${diffDays}`;
    };

    // 상태 텍스트 변환 (백엔드 NoncurConstants와 동일)
    const getStatusText = (statusCode) => {
        if (!statusCode) return '알 수 없음';
        
        const statusMap = {
            '01': '모집중',
            '02': '마감임박',
            '03': '모집완료',
            '04': '운영중',
            '05': '종료'
        };
        return statusMap[statusCode] || '알 수 없음';
    };

    // 상태별 스타일 클래스
    const getStatusClass = (statusCode) => {
        const classMap = {
            '01': 'status-recruiting',
            '02': 'status-deadline',
            '03': 'status-closed',
            '04': 'status-running',
            '05': 'status-ended'
        };
        return classMap[statusCode] || 'status-default';
    };

    // 필터 변경 핸들러
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'keyword') {
            setSearchParams(prev => ({
                ...prev,
                [name]: value
            }));
        } else {
            setSearchParams(prev => ({
                ...prev,
                [name]: value,
                page: 0
            }));
        }
    };

    // 검색 실행 핸들러
    const handleSearch = () => {
        setSearchParams(prev => ({
            ...prev,
            page: 0
        }));
    };

    // Enter 키 핸들러
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 공유 기능
    const handleShare = (e, program) => { 
        e.stopPropagation(); 

        if (navigator.share) {
            navigator.share({
                title: program.prgNm,
                text: program.prgDesc,
                url: `${window.location.origin}/noncur/${program.prgId}`
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('링크가 클립보드에 복사되었습니다.');
        }
    };

    // 페이지네이션 버튼 렌더링 함수
    const renderPaginationButtons = () => {
        const buttons = [];
        const { currentPage, totalPages } = pagination;
        
        buttons.push(
            <button 
                key="prev"
                className="pagination-btn" 
                disabled={pagination.isFirst}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                이전
            </button>
        );

        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            );
        }

        buttons.push(
            <button 
                key="next"
                className="pagination-btn" 
                disabled={pagination.isLast}
                onClick={() => handlePageChange(currentPage + 1)}
            >
                다음
            </button>
        );

        return buttons;
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container_layout">
                    <Sidebar />
                    <div className="noncur-list-page">
                        <div className="loading">로딩 중...</div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container_layout">
                    <Sidebar />
                    <div className="noncur-list-page">
                        <div className="error">오류: {error}</div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container_layout">
                <Sidebar />
                <div className="noncur-list-page">
                    <h4>비교과 프로그램</h4>
                    
                    {/* 마이페이지 버튼 */}
                    <button
                        onClick={() => setShowMyPageModal(true)}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s',
                            boxShadow: '0 2px 4px rgba(40,167,69,0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#218838';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(40,167,69,0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#28a745';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(40,167,69,0.2)';
                        }}
                    >
                        🎓 내 비교과 활동
                    </button>

                    {/* 검색 및 필터 */}
                    <div className="filter-section">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                name="keyword"
                                placeholder="프로그램 검색..."
                                value={searchParams.keyword}
                                onChange={handleFilterChange}
                                onKeyPress={handleKeyPress}
                                className="search-input"
                            />
                            <button 
                                type="button" 
                                onClick={handleSearch}
                                className="search-btn"
                            >
                                검색
                            </button>
                        </div>
                        <select 
                            id='program_filter' 
                            name="searchStatusCode"
                            className='noncur-select'
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
                    </div>

                    {/* 검색 결과 수 표시 */}
                    <div className="result-info">
                        총 {pagination.totalElements}개의 프로그램이 있습니다. 
                        ({pagination.currentPage + 1}/{pagination.totalPages} 페이지)
                    </div>

                    <div className='noncur-list'>
                        {programs.length === 0 ? (
                            <div className="no-programs">등록된 프로그램이 없습니다.</div>
                        ) : (
                            programs.map((program) => (
                                <div 
                                    key={program.prgId} 
                                    className='noncur-item clickable'
                                    onClick={() => handleProgramClick(program.prgId)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className='topWrap'>
                                        <img 
                                            src="/images/default-program.jpg"
                                            alt={program.prgNm} 
                                            className='noncur-image'
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05MCA2MEw3MCA4MEg5MEg5MEwxMTAgODBMOTAgNjBaIiBmaWxsPSIjQ0REMUQzIi8+Cjwvc3ZnPg==";
                                            }}
                                        />
                                        <div className='dayWrap'>
                                            <span className={`noncur-day ${getStatusClass(program.prgStatCd)}`}>
                                                {calculateDDay(program.prgEndDt)}
                                                <span className='noncur-point'>
                                                    <span className="material-symbols-outlined">paid</span>
                                                    {programMileages[program.prgId] || 0}
                                                </span>
                                            </span>
                                            <button 
                                                type='button' 
                                                className='noncur-share'
                                                onClick={(e) => handleShare(e, program)}
                                            >
                                                <span className="material-symbols-outlined">share</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className='bottomWrap'>
                                        <span className='noncur-title'>{program.prgNm}</span>
                                        <span className='noncur-subtitle'>
                                            {program.prgDesc?.substring(0, 50)}
                                            {program.prgDesc?.length > 50 ? '...' : ''}
                                        </span>
                                        <span className='noncur-date'>
                                            {formatDate(program.prgStDt)} ~ {formatDate(program.prgEndDt)}
                                        </span>
                                        <span className='noncur-status'>
                                            상태: {getStatusText(program.prgStatCd)} | 모집인원: {program.maxCnt}명
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* 동적 페이지네이션 */}
                    {pagination.totalPages > 1 && (
                        <div className='pageCircle'>
                            {renderPaginationButtons()}
                        </div>
                    )}

                    {/* 마이페이지 모달 */}
                    <StudentNoncurMyPageModal 
                        isOpen={showMyPageModal}
                        onClose={() => setShowMyPageModal(false)}
                    /> 
                </div>
            </div>
            <Footer />
        </>
    );
};

export default NoncurricularListPage;