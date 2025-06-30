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
import { useNavigate } from 'react-router-dom';
import { counselingApi } from '../services/api'; 

const CounselingRecordPage = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(true);
  const navigate = useNavigate();
  
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
      navigate('/admin/counseling');
    } else {
      alert('저장 실패: ' + result.error);
    }
  };
/*  
  useEffect(() => {
    const checkSchedule = async () => {

      if (!counselingDetail?.emplNo) {
        return;
      }

      try {
        const res = await counselingApi.checkScheduleExists(counselingDetail.emplNo);
		
        if (!res?.exists) {
          setShowModal(true);
        } else {
          setShowModal(false);
        }

        setHasSchedule(res.exists);
      } catch (err) {
        console.error('checkSchedule 실패:', err);
        setShowModal(true); // 예외 시에도 열기
      }
    };

    if (!detailLoading && counselingDetail?.emplNo) {

      checkSchedule();
    } 
  }, [detailLoading, counselingDetail]);
 */ 
  const handleSaveSchedule = async (scheduleData) => {
    const result = await saveSchedule(scheduleData);
    if (result.success) {
      alert('상담 일정이 등록되었습니다.');
      setHasSchedule(true); // 상태 갱신
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
            <b>{counselingDetail?.stdNm || '홍길동'}</b> 학생의 상담 신청 내역
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