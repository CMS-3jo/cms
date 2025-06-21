import React, { useState, useEffect } from 'react';
import 'public/css/NoncurAdminDashboard.css'; // 스타일시트 추가


const NoncurAdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    myPrograms: [],
    deptPrograms: [],
    recentApplications: [],
    statistics: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchDashboardData();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/info', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 내가 등록한 프로그램
      const myProgramsRes = await fetch('/api/noncur?regUserId=me', {
        credentials: 'include'
      });
      
      // 우리 부서 프로그램
      const deptProgramsRes = await fetch('/api/admin/noncur/departments/my/programs', {
        credentials: 'include'
      });
      
      // 최근 신청 현황
      const applicationsRes = await fetch('/api/admin/noncur/recent-applications', {
        credentials: 'include'
      });
      
      // 통계
      const statsRes = await fetch('/api/admin/noncur/statistics', {
        credentials: 'include'
      });
      
      if (myProgramsRes.ok && deptProgramsRes.ok && applicationsRes.ok && statsRes.ok) {
        const myPrograms = await myProgramsRes.json();
        const deptPrograms = await deptProgramsRes.json();
        const applications = await applicationsRes.json();
        const stats = await statsRes.json();
        
        setDashboardData({
          myPrograms: myPrograms.programs || [],
          deptPrograms: deptPrograms.programs || [],
          recentApplications: applications.applications || [],
          statistics: stats
        });
      }
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>비교과 프로그램 관리 대시보드</h2>
        {userInfo && (
          <div className="user-info">
            <span>{userInfo.name} ({userInfo.deptName})</span>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        {/* 통계 카드 */}
        <div className="stat-cards">
          <div className="stat-card primary">
            <h3>내가 등록한 프로그램</h3>
            <div className="stat-value">{dashboardData.myPrograms.length}</div>
          </div>
          <div className="stat-card success">
            <h3>우리 부서 프로그램</h3>
            <div className="stat-value">{dashboardData.deptPrograms.length}</div>
          </div>
          <div className="stat-card warning">
            <h3>승인 대기</h3>
            <div className="stat-value">{dashboardData.statistics.pendingCount || 0}</div>
          </div>
          <div className="stat-card info">
            <h3>오늘 신청</h3>
            <div className="stat-value">{dashboardData.statistics.todayCount || 0}</div>
          </div>
        </div>

        {/* 내가 등록한 프로그램 */}
        <div className="dashboard-section">
          <h3>내가 등록한 프로그램</h3>
          <div className="program-list">
            {dashboardData.myPrograms.length > 0 ? (
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>프로그램명</th>
                    <th>상태</th>
                    <th>신청자</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.myPrograms.slice(0, 5).map(program => (
                    <tr key={program.prgId}>
                      <td>{program.prgNm}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(program.prgStatCd)}`}>
                          {program.prgStatNm}
                        </span>
                      </td>
                      <td>{program.currentApplicants || 0} / {program.maxCnt}</td>
                      <td>
                        <button 
                          className="manage-btn"
                          onClick={() => window.location.href = `/admin/noncur/program/${program.prgId}`}
                        >
                          관리
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">등록한 프로그램이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 우리 부서 프로그램 */}
        <div className="dashboard-section">
          <h3>우리 부서 프로그램</h3>
          <div className="program-list">
            {dashboardData.deptPrograms.length > 0 ? (
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>프로그램명</th>
                    <th>담당자</th>
                    <th>상태</th>
                    <th>신청자</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.deptPrograms.slice(0, 5).map(program => (
                    <tr key={program.prgId}>
                      <td>{program.prgNm}</td>
                      <td>{program.regUserNm || program.regUserId}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(program.prgStatCd)}`}>
                          {program.prgStatNm}
                        </span>
                      </td>
                      <td>{program.currentApplicants || 0} / {program.maxCnt}</td>
                      <td>
                        <button 
                          className="manage-btn"
                          onClick={() => window.location.href = `/admin/noncur/program/${program.prgId}`}
                        >
                          관리
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">부서 프로그램이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 최근 신청 현황 */}
        <div className="dashboard-section full-width">
          <h3>최근 신청 현황</h3>
          <div className="application-list">
            {dashboardData.recentApplications.length > 0 ? (
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>신청일시</th>
                    <th>프로그램명</th>
                    <th>학번</th>
                    <th>이름</th>
                    <th>상태</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentApplications.map(app => (
                    <tr key={app.aplyId}>
                      <td>{new Date(app.aplyDt).toLocaleString()}</td>
                      <td>{app.prgNm}</td>
                      <td>{app.stdNo}</td>
                      <td>{app.stdNm || '-'}</td>
                      <td>
                        <span className={`status-badge ${getApplicationStatusClass(app.aplyStatCd)}`}>
                          {app.aplyStatNm}
                        </span>
                      </td>
                      <td>
                        {app.aplyStatCd === '01' && (
                          <div className="quick-actions">
                            <button 
                              className="quick-btn approve"
                              onClick={() => handleQuickApprove(app.aplyId)}
                            >
                              승인
                            </button>
                            <button 
                              className="quick-btn reject"
                              onClick={() => handleQuickReject(app.aplyId)}
                            >
                              거부
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-message">최근 신청이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function getStatusClass(statusCd) {
    switch (statusCd) {
      case '01': return 'recruiting';
      case '02': return 'deadline';
      case '03': return 'closed';
      case '04': return 'progress';
      case '05': return 'completed';
      default: return '';
    }
  }

  function getApplicationStatusClass(statusCd) {
    switch (statusCd) {
      case '01': return 'applied';
      case '02': return 'approved';
      case '03': return 'rejected';
      case '04': return 'cancelled';
      case '05': return 'completed';
      default: return '';
    }
  }

  async function handleQuickApprove(aplyId) {
    if (!confirm('승인하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/admin/noncur/applications/${aplyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ statusCd: '02' })
      });
      
      if (response.ok) {
        alert('승인되었습니다.');
        fetchDashboardData();
      }
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    }
  }

  async function handleQuickReject(aplyId) {
    const reason = prompt('거부 사유를 입력하세요:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/admin/noncur/applications/${aplyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ statusCd: '03', rejectReason: reason })
      });
      
      if (response.ok) {
        alert('거부되었습니다.');
        fetchDashboardData();
      }
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    }
  }
};

export default NoncurAdminDashboard;