// src/pages/CounselingRecordPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import CounselingRecordForm from '../components/counseling/CounselingRecordForm';
import ScheduleModal from '../components/counseling/ScheduleModal';
import { useCounselingDetail } from '../hooks/useCounselingDetail';
import { useCounselingRecord } from '../hooks/useCounselingRecord';

const CounselingRecordPage = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  
  const { counselingDetail, loading: detailLoading, fetchCounselingDetail } = useCounselingDetail();
  const { 
    recordData, 
    loading: recordLoading, 
    fetchRecord,
    saveRecord, 
    saveSchedule 
  } = useCounselingRecord();

  useEffect(() => {
    if (id) {
      fetchCounselingDetail(id);
      fetchRecord(id);
    }
  }, [id, fetchCounselingDetail, fetchRecord]);

  const handleSaveRecord = async (recordData) => {
    const result = await saveRecord(id, recordData);
    if (result.success) {
      alert('상담 일지가 저장되었습니다.');
    } else {
      alert('저장 실패: ' + result.error);
    }
  };

  const handleSaveSchedule = async (scheduleData) => {
    const result = await saveSchedule(scheduleData);
    if (result.success) {
      alert('상담 일정이 등록되었습니다.');
      setShowModal(false);
    } else {
      alert('등록 실패: ' + result.error);
    }
  };

  if (detailLoading || recordLoading) return <div>로딩 중...</div>;

  return (
    <>
      <Header />
      
      <article className="container_layout">
        <Sidebar />
        
        <section className="contents">
          <h4 className="board_title">
            <b>{counselingDetail?.name || '홍길동'}</b> 학생의 상담 신청 내역
          </h4>
          
          <CounselingRecordForm 
            counselingDetail={counselingDetail}
            recordData={recordData}
            onSaveRecord={handleSaveRecord}
            onOpenScheduleModal={() => setShowModal(true)}
            loading={recordLoading}
          />
          
          {showModal && (
            <ScheduleModal
              studentData={counselingDetail}
              onSave={handleSaveSchedule}
              onClose={() => setShowModal(false)}
            />
          )}
        </section>
      </article>
      
      <Footer />
    </>
  );
};

export default CounselingRecordPage;