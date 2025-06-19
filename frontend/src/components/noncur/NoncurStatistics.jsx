import React from 'react';
import '/public/css/NoncurStatistics.css';

const NoncurStatistics = ({ statistics }) => {
  if (!statistics) {
    return <div>통계 데이터를 불러오는 중...</div>;
  }

  const {
    totalPrograms,
    programsByStatus,
    totalApplications,
    applicationsByStatus,
    departmentStats,
    monthlyStats
  } = statistics;

  return (
    <div className="statistics-container">
      {/* 전체 현황 */}
      <div className="stat-section">
        <h3>전체 현황</h3>
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-value">{totalPrograms || 0}</div>
            <div className="stat-label">전체 프로그램</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalApplications || 0}</div>
            <div className="stat-label">전체 신청건수</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{programsByStatus?.['01'] || 0}</div>
            <div className="stat-label">모집중 프로그램</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{applicationsByStatus?.['02'] || 0}</div>
            <div className="stat-label">승인 대기</div>
          </div>
        </div>
      </div>

      {/* 프로그램 상태별 통계 */}
      <div className="stat-section">
        <h3>프로그램 상태별 현황</h3>
        <div className="stat-table-wrapper">
          <table className="stat-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>프로그램 수</th>
                <th>비율</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>모집중</td>
                <td>{programsByStatus?.['01'] || 0}</td>
                <td>{calculatePercentage(programsByStatus?.['01'], totalPrograms)}%</td>
              </tr>
              <tr>
                <td>마감임박</td>
                <td>{programsByStatus?.['02'] || 0}</td>
                <td>{calculatePercentage(programsByStatus?.['02'], totalPrograms)}%</td>
              </tr>
              <tr>
                <td>모집완료</td>
                <td>{programsByStatus?.['03'] || 0}</td>
                <td>{calculatePercentage(programsByStatus?.['03'], totalPrograms)}%</td>
              </tr>
              <tr>
                <td>운영중</td>
                <td>{programsByStatus?.['04'] || 0}</td>
                <td>{calculatePercentage(programsByStatus?.['04'], totalPrograms)}%</td>
              </tr>
              <tr>
                <td>종료</td>
                <td>{programsByStatus?.['05'] || 0}</td>
                <td>{calculatePercentage(programsByStatus?.['05'], totalPrograms)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 신청 상태별 통계 */}
      <div className="stat-section">
        <h3>신청 상태별 현황</h3>
        <div className="stat-table-wrapper">
          <table className="stat-table">
            <thead>
              <tr>
                <th>상태</th>
                <th>신청 수</th>
                <th>비율</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>신청완료</td>
                <td>{applicationsByStatus?.['01'] || 0}</td>
                <td>{calculatePercentage(applicationsByStatus?.['01'], totalApplications)}%</td>
              </tr>
              <tr>
                <td>승인</td>
                <td>{applicationsByStatus?.['02'] || 0}</td>
                <td>{calculatePercentage(applicationsByStatus?.['02'], totalApplications)}%</td>
              </tr>
              <tr>
                <td>거부</td>
                <td>{applicationsByStatus?.['03'] || 0}</td>
                <td>{calculatePercentage(applicationsByStatus?.['03'], totalApplications)}%</td>
              </tr>
              <tr>
                <td>취소</td>
                <td>{applicationsByStatus?.['04'] || 0}</td>
                <td>{calculatePercentage(applicationsByStatus?.['04'], totalApplications)}%</td>
              </tr>
              <tr>
                <td>이수완료</td>
                <td>{applicationsByStatus?.['05'] || 0}</td>
                <td>{calculatePercentage(applicationsByStatus?.['05'], totalApplications)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 부서별 통계 */}
      {departmentStats && (
        <div className="stat-section">
          <h3>부서별 프로그램 현황</h3>
          <div className="stat-table-wrapper">
            <table className="stat-table">
              <thead>
                <tr>
                  <th>부서</th>
                  <th>프로그램 수</th>
                  <th>신청자 수</th>
                  <th>이수완료</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(departmentStats).map(([deptName, stats]) => (
                  <tr key={deptName}>
                    <td>{deptName}</td>
                    <td>{stats.programCount || 0}</td>
                    <td>{stats.applicationCount || 0}</td>
                    <td>{stats.completedCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  function calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return ((value || 0) / total * 100).toFixed(1);
  }
};

export default NoncurStatistics;