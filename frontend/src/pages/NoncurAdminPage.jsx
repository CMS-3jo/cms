import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import NoncurProgramList from '../components/noncur/NoncurProgramList.jsx';
import NoncurApplicationList from '../components/noncur/NoncurApplicationList';
import NoncurStatistics from '../components/noncur/NoncurStatistics';
import { useNoncurAdmin } from '../hooks/useNoncurAdmin.js';
import '/public/css/NoncurAdminPage.css'; 
import { useNavigate } from 'react-router-dom'; 

const NoncurAdminPage = () => {
  const [activeTab, setActiveTab] = useState('programs');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);

  const {
    programs,
    applications,
    statistics,
    loading,
    error,
    fetchPrograms,
    fetchApplications,
    fetchStatistics,
    updateApplicationStatus,
    updateProgramStatus,
    completeApplication,
    batchUpdateStatus,
    batchCompleteApplications,
    deleteProgram,
    updateProgram,
    getProgramForEdit
  } = useNoncurAdmin();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/noncur/departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('부서 목록 조회 실패:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (activeTab === 'programs') {
      fetchPrograms();
    } else if (activeTab === 'statistics') {
      fetchStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedProgram) {
      fetchApplications(selectedProgram.prgId);
    }
  }, [selectedProgram]);

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setActiveTab('applications');
  };

  const handleProgramDelete = async (prgId) => {
    if (window.confirm('프로그램을 삭제하시겠습니까?\n관련 파일과 신청 정보도 함께 삭제됩니다.')) {
      try {
        await deleteProgram(prgId);
        alert('프로그램이 삭제되었습니다.');
        fetchPrograms(); // 목록 새로고침
      } catch (error) {
        alert('프로그램 삭제에 실패했습니다: ' + error.message);
      }
    }
  };

  // 수정된 handleProgramEdit 함수
  const handleProgramEdit = (program) => {
    console.log('프로그램 수정 페이지로 이동:', program.prgId);
    // 수정 페이지로 직접 이동
    navigate(`/noncur/${program.prgId}/edit`);
  };

  const handleProgramRegister = () => {
    navigate('/noncur/register'); // 등록 페이지로 이동
    console.log('새 프로그램 등록');
  };

  const handleApplicationStatusChange = async (aplyId, statusCd, rejectReason = null) => {
    try {
      await updateApplicationStatus(aplyId, statusCd, rejectReason);
      // 새로고침
      if (selectedProgram) {
        fetchApplications(selectedProgram.prgId);
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleProgramStatusChange = async (prgId, statusCd) => {
    try {
      await updateProgramStatus(prgId, statusCd);
      fetchPrograms();
    } catch (error) {
      console.error('프로그램 상태 변경 실패:', error);
      alert('프로그램 상태 변경에 실패했습니다.');
    }
  };

  const handleCompleteApplication = async (aplyId) => {
    try {
      await completeApplication(aplyId);
      if (selectedProgram) {
        fetchApplications(selectedProgram.prgId);
      }
      alert('이수완료 처리되었습니다. 마일리지가 부여되었습니다.');
    } catch (error) {
      console.error('이수완료 처리 실패:', error);
      alert('이수완료 처리에 실패했습니다.');
    }
  };

  const handleBatchAction = async (aplyIds, action) => {
    try {
      if (action === 'complete') {
        await batchCompleteApplications(aplyIds);
      } else {
        await batchUpdateStatus(aplyIds, action);
      }
      if (selectedProgram) {
        fetchApplications(selectedProgram.prgId);
      }
    } catch (error) {
      console.error('일괄 처리 실패:', error);
      alert('일괄 처리에 실패했습니다.');
    }
  };

  return (
    <>
      <Header />
      <main>
        <article className="container_layout">
          <Sidebar />
          
          <section className="contents">
            <div className="admin-header">
              <h2 className="admin-title">비교과 프로그램 관리</h2>
              <div className="tab-menu">
                <button 
                  className={`tab-btn ${activeTab === 'programs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('programs')}
                >
                  프로그램 관리
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('applications')}
                  disabled={!selectedProgram}
                >
                  신청자 관리
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('statistics')}
                >
                  통계
                </button>
              </div>
            </div>

            <div className="admin-content">
              {loading && <div className="loading">로딩 중...</div>}
              {error && <div className="error">오류: {error.message}</div>}
              
              {activeTab === 'programs' && (
                <NoncurProgramList 
                  programs={programs}
                  departments={departments}  
                  onProgramSelect={handleProgramSelect}
                  onStatusChange={handleProgramStatusChange}
                  onEdit={handleProgramEdit}            
                  onDelete={handleProgramDelete}       
                  onRegister={handleProgramRegister}    
                />
              )}
              
              {activeTab === 'applications' && selectedProgram && (
                <NoncurApplicationList 
                  program={selectedProgram}
                  applications={applications}
                  onStatusChange={handleApplicationStatusChange}
                  onComplete={handleCompleteApplication}
                  onBatchAction={handleBatchAction}
                />
              )}
              
              {activeTab === 'statistics' && (
                <NoncurStatistics statistics={statistics} />
              )}
            </div>
          </section>
        </article>
      </main>
      
      <Footer />
    </>
  );
};

export default NoncurAdminPage;