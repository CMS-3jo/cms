import React, { useState, useEffect } from 'react';
import '/public/css/NoncurApplicationList.css';

const NoncurApplicationList = ({ 
  program, 
  applications, 
  onStatusChange, 
  onComplete,
  onBatchAction 
}) => {
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [applicationFiles, setApplicationFiles] = useState({}); // 신청서 파일 정보

  // 신청서 파일 정보 조회
  useEffect(() => {
    const fetchApplicationFiles = async () => {
      const fileInfos = {};
      
      for (const app of applications) {
        try {
          const response = await fetch(`/api/files/list?refType=NONCUR&refId=${app.aplyId}&category=APPLY`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const files = await response.json();
            if (files && files.length > 0) {
              fileInfos[app.aplyId] = files;
            }
          } else {
            console.warn(`파일 조회 응답 오류 (${app.aplyId}): ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error(`신청서 파일 조회 실패 (${app.aplyId}):`, error);
        }
      }
      
      setApplicationFiles(fileInfos);
    };

    if (applications && applications.length > 0) {
      fetchApplicationFiles();
    }
  }, [applications]);

  const handleFileDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const filteredApplications = applications.filter(app => {
    return filterStatus === 'all' || app.aplyStatCd === filterStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedApplications(filteredApplications.map(app => app.aplyId));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectOne = (aplyId) => {
    setSelectedApplications(prev => {
      if (prev.includes(aplyId)) {
        return prev.filter(id => id !== aplyId);
      } else {
        return [...prev, aplyId];
      }
    });
  };

  const handleStatusChange = (aplyId, statusCd) => {
    if (statusCd === '03') { // 거부
      setRejectTarget(aplyId);
      setShowRejectModal(true);
    } else {
      onStatusChange(aplyId, statusCd);
    }
  };

  const handleRejectConfirm = () => {
    if (rejectTarget) {
      onStatusChange(rejectTarget, '03', rejectReason);
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectReason('');
    }
  };

  const handleBatchAction = (action) => {
    if (selectedApplications.length === 0) {
      alert('선택된 신청자가 없습니다.');
      return;
    }

    const confirmMessage = action === 'complete' 
      ? '선택한 신청자들을 이수완료 처리하시겠습니까?\n마일리지가 부여됩니다.'
      : `선택한 신청자들을 ${getActionName(action)} 처리하시겠습니까?`;

    if (confirm(confirmMessage)) {
      onBatchAction(selectedApplications, action);
      setSelectedApplications([]);
    }
  };

  const getActionName = (action) => {
    switch(action) {
      case '02': return '승인';
      case '03': return '거부';
      case '04': return '취소';
      case 'complete': return '이수완료';
      default: return action;
    }
  };

  const getStatusBadgeClass = (statusCd) => {
    switch (statusCd) {
      case '01': return 'badge-applied';
      case '02': return 'badge-approved';
      case '03': return 'badge-rejected';
      case '04': return 'badge-cancelled';
      case '05': return 'badge-completed';
      default: return '';
    }
  };

  const applicationStatusOptions = [
    { value: '01', label: '신청완료' },
    { value: '02', label: '승인' },
    { value: '03', label: '거부' },
    { value: '04', label: '취소' },
    { value: '05', label: '이수완료' }
  ];

  return (
    <div className="application-list-container">
      <div className="program-info">
        <h3>{program.prgNm}</h3>
        <p>{program.deptName} | 정원: {program.maxCnt}명 | 신청: {applications.length}명</p>
      </div>

      <div className="action-section">
        <div className="filter-group">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">모든 상태</option>
            {applicationStatusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="batch-actions">
          <button 
            className="batch-btn approve"
            onClick={() => handleBatchAction('02')}
            disabled={selectedApplications.length === 0}
          >
            일괄 승인
          </button>
          <button 
            className="batch-btn reject"
            onClick={() => handleBatchAction('03')}
            disabled={selectedApplications.length === 0}
          >
            일괄 거부
          </button>
          <button 
            className="batch-btn complete"
            onClick={() => handleBatchAction('complete')}
            disabled={selectedApplications.length === 0}
          >
            일괄 이수완료
          </button>
        </div>
      </div>

      <table className="application-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
              />
            </th>
            <th>신청번호</th>
            <th>학번</th>
            <th>이름</th>
            <th>신청일시</th>
            <th>신청구분</th>
            <th>신청서</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map(app => (
            <tr key={app.aplyId}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedApplications.includes(app.aplyId)}
                  onChange={() => handleSelectOne(app.aplyId)}
                />
              </td>
              <td>{app.aplyId}</td>
              <td>{app.stdNo}</td>
              <td>{app.stdNm || '-'}</td>
              <td>{new Date(app.aplyDt).toLocaleString()}</td>
              <td>{app.aplySelNm || '일반신청'}</td>
              <td>
                {(() => {
                  const files = applicationFiles[app.aplyId];
                  
                  // 파일이 존재하고 배열인지 안전하게 확인
                  if (!files || !Array.isArray(files) || files.length === 0) {
                    return <span className="text-muted">-</span>;
                  }
                  
                  return (
                    <div className="application-files">
                      {files.map((file, index) => {
                        const fileName = file?.fileNmOrig || `파일${index + 1}`;
                        const fileId = file?.fileId;
                        
                        // fileId가 없으면 버튼을 렌더링하지 않음
                        if (!fileId) {
                          return (
                            <span key={index} className="text-danger small">
                              오류
                            </span>
                          );
                        }
                        
                        return (
                          <button
                            key={fileId}
                            className="btn btn-link btn-sm p-0 text-dark"
                            onClick={() => handleFileDownload(fileId, fileName)}
                            title={`신청서 다운로드: ${fileName}`}
                            style={{
                              textDecoration: 'none',
                              transition: 'color 0.2s ease',
                              boxShadow: 'none',
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#0d6efd'}
                            onMouseLeave={(e) => e.target.style.color = '#212529'}
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </td>
              <td>
                <span className={`status-badge ${getStatusBadgeClass(app.aplyStatCd)}`}>
                  {app.aplyStatNm}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  {app.aplyStatCd === '01' && (
                    <>
                      <button 
                        className="action-btn approve"
                        onClick={() => handleStatusChange(app.aplyId, '02')}
                      >
                        승인
                      </button>
                      <button 
                        className="action-btn reject"
                        onClick={() => handleStatusChange(app.aplyId, '03')}
                      >
                        거부
                      </button>
                    </>
                  )}
                  {app.aplyStatCd === '02' && (
                    <button 
                      className="action-btn complete"
                      onClick={() => onComplete(app.aplyId)}
                    >
                      이수완료
                    </button>
                  )}
                  {app.aplyStatCd === '05' && (
                    <span className="completed-text">처리완료</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 거부 사유 모달 */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>거부 사유 입력</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거부 사유를 입력하세요..."
              rows="4"
              className="reject-reason-textarea"
            />
            <div className="modal-buttons">
              <button 
                className="modal-btn confirm"
                onClick={handleRejectConfirm}
              >
                확인
              </button>
              <button 
                className="modal-btn cancel"
                onClick={() => setShowRejectModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoncurApplicationList;