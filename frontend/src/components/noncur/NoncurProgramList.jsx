import React, { useState } from 'react';
import '/public/css/NoncurProgramList.css';

const NoncurProgramList = ({ programs, onProgramSelect, onStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.prgNm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || program.prgStatCd === filterStatus;
    const matchesDept = filterDept === 'all' || program.prgDeptCd === filterDept;
    
    return matchesSearch && matchesStatus && matchesDept;
  });

  const getStatusBadgeClass = (statusCd) => {
    switch (statusCd) {
      case '01': return 'badge-recruiting';
      case '02': return 'badge-deadline';
      case '03': return 'badge-closed';
      case '04': return 'badge-progress';
      case '05': return 'badge-completed';
      default: return '';
    }
  };

  const statusOptions = [
    { value: '01', label: '모집중' },
    { value: '02', label: '마감임박' },
    { value: '03', label: '모집완료' },
    { value: '04', label: '운영중' },
    { value: '05', label: '종료' }
  ];

  return (
    <div className="program-list-container">
      <div className="filter-section">
        <input
          type="text"
          placeholder="프로그램명 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">모든 상태</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <select 
          value={filterDept} 
          onChange={(e) => setFilterDept(e.target.value)}
          className="filter-select"
        >
          <option value="all">모든 부서</option>
          <option value="DEPT001">학생지원팀</option>
          <option value="DEPT002">교무팀</option>
          <option value="DEPT003">취업지원센터</option>
          <option value="DEPT004">SW교육센터</option>
        </select>
      </div>

      <div className="program-stats">
        <span>총 {filteredPrograms.length}개 프로그램</span>
      </div>

      <table className="program-table">
        <thead>
          <tr>
            <th>프로그램명</th>
            <th>운영부서</th>
            <th>모집기간</th>
            <th>정원</th>
            <th>신청자</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrograms.map(program => (
            <tr key={program.prgId}>
              <td>
                <button 
                  className="program-name-btn"
                  onClick={() => onProgramSelect(program)}
                >
                  {program.prgNm}
                </button>
              </td>
              <td>{program.deptName}</td>
              <td>
                {new Date(program.prgStDt).toLocaleDateString()} ~ 
                {new Date(program.prgEndDt).toLocaleDateString()}
              </td>
              <td>{program.maxCnt}명</td>
              <td>{program.currentApplicants || 0}명</td>
              <td>
                <span className={`status-badge ${getStatusBadgeClass(program.prgStatCd)}`}>
                  {program.prgStatNm}
                </span>
              </td>
              <td>
                <select
                  value={program.prgStatCd}
                  onChange={(e) => onStatusChange(program.prgId, e.target.value)}
                  className="status-select"
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NoncurProgramList;