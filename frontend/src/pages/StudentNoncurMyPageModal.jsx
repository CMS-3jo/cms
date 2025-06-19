import React, { useState, useEffect } from 'react';

const StudentNoncurMyPageModal = ({ isOpen, onClose }) => {
    const [studentData, setStudentData] = useState({
        applications: [],
        completedPrograms: [],
        totalMileage: 0,
        mileageHistory: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('applications');

    const fetchStudentData = async () => {
        if (!isOpen) return;
        
        setLoading(true);
        setError(null);
        
        try {
            // 1. 내 신청 내역 조회 (토큰에서 자동으로 학번 추출)
            const applicationsResponse = await fetch('/api/noncur/applications/my', {
                credentials: 'include'
            });
            let applications = [];
            if (applicationsResponse.ok) {
                applications = await applicationsResponse.json();
            }

            // 2. 내 이수완료 내역 조회 (토큰에서 자동으로 학번 추출)
            const completionsResponse = await fetch('/api/noncur/completion/my', {
                credentials: 'include'
            });
            let completedPrograms = [];
            if (completionsResponse.ok) {
                const completionData = await completionsResponse.json();
                completedPrograms = completionData.completedPrograms || [];
            }

            // 3. 내 마일리지 정보 조회 (마일리지 컨트롤러 사용)
            const mileageResponse = await fetch('/api/mileage/my', {
                credentials: 'include'
            });
            let mileageData = { totalMileage: 0, recentHistory: [] };
            if (mileageResponse.ok) {
                mileageData = await mileageResponse.json();
            }

            setStudentData({
                applications,
                completedPrograms,
                totalMileage: mileageData.totalMileage || 0,
                mileageHistory: mileageData.recentHistory || []
            });

        } catch (err) {
            console.error('데이터 조회 실패:', err);
            setError('데이터를 불러오는데 실패했습니다. 다시 로그인해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentData();
    }, [isOpen]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const getStatusBadge = (statusCd, statusNm) => {
        const statusClass = {
            '01': 'badge-applied',
            '02': 'badge-approved', 
            '03': 'badge-rejected',
            '04': 'badge-cancelled',
            '05': 'badge-completed'
        }[statusCd] || 'badge-default';

        return (
            <span className={`status-badge ${statusClass}`}>
                {statusNm || '알 수 없음'}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '80vh',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }} onClick={(e) => e.stopPropagation()}>
                
                {/* 헤더 */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, color: '#333' }}>내 비교과 활동</h2>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '5px'
                    }}>×</button>
                </div>

                {/* 마일리지 요약 */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #eee'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                                {studentData.totalMileage}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>총 마일리지</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                                {studentData.completedPrograms.length}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>이수완료</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
                                {studentData.applications.length}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>총 신청</div>
                        </div>
                    </div>
                </div>

                {/* 탭 메뉴 */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #eee'
                }}>
                    {[
                        { key: 'applications', label: '신청 내역' },
                        { key: 'completed', label: '이수완료' },
                        { key: 'mileage', label: '마일리지 내역' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: 'none',
                                backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                                color: activeTab === tab.key ? 'white' : '#333',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 영역 */}
                <div style={{
                    padding: '20px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            로딩 중...
                        </div>
                    )}

                    {error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            color: '#dc3545'
                        }}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* 신청 내역 */}
                            {activeTab === 'applications' && (
                                <div>
                                    {studentData.applications.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            신청한 프로그램이 없습니다.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {studentData.applications.map(app => (
                                                <div key={app.aplyId} style={{
                                                    border: '1px solid #eee',
                                                    borderRadius: '8px',
                                                    padding: '16px',
                                                    backgroundColor: '#fafafa'
                                                }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <h4 style={{ margin: 0 }}>
                                                            {app.prgNm || `프로그램 ${app.prgId}`}
                                                        </h4>
                                                        {getStatusBadge(app.aplyStatCd, app.aplyStatNm)}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                                        신청일: {formatDate(app.aplyDt)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 이수완료 */}
                            {activeTab === 'completed' && (
                                <div>
                                    {studentData.completedPrograms.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            이수완료한 프로그램이 없습니다.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {studentData.completedPrograms.map(program => (
                                                <div key={program.aplyId} style={{
                                                    border: '1px solid #28a745',
                                                    borderRadius: '8px',
                                                    padding: '16px',
                                                    backgroundColor: '#f8fff9'
                                                }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <h4 style={{ margin: 0, color: '#28a745' }}>
                                                            ✅ {program.prgNm || `프로그램 ${program.prgId}`}
                                                        </h4>
                                                        <span style={{ 
                                                            color: '#28a745', 
                                                            fontWeight: 'bold',
                                                            fontSize: '14px'
                                                        }}>
                                                            이수완료
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#666' }}>
                                                        신청일: {formatDate(program.aplyDt)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 마일리지 내역 */}
                            {activeTab === 'mileage' && (
                                <div>
                                    {studentData.mileageHistory.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            마일리지 내역이 없습니다.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {studentData.mileageHistory.map((item, index) => (
                                                <div key={index} style={{
                                                    border: '1px solid #eee',
                                                    borderRadius: '8px',
                                                    padding: '16px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            {item.prgNm || '프로그램'}
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: '#666' }}>
                                                            {formatDate(item.mlgDt)} | {item.mlgAddNm}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        fontWeight: 'bold',
                                                        color: item.mlgAddCd === '01' ? '#007bff' : '#dc3545'
                                                    }}>
                                                        {item.mlgAddCd === '01' ? '+' : '-'}{item.mlgScore}점
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    text-align: center;
                }
                .badge-applied { background-color: #e3f2fd; color: #1976d2; }
                .badge-approved { background-color: #e8f5e8; color: #388e3c; }
                .badge-rejected { background-color: #ffebee; color: #d32f2f; }
                .badge-cancelled { background-color: #f3e5f5; color: #7b1fa2; }
                .badge-completed { background-color: #e8f5e8; color: #2e7d32; }
                .badge-default { background-color: #f5f5f5; color: #666; }
            `}</style>
        </div>
    );
};

export default StudentNoncurMyPageModal;