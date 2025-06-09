// src/pages/CounselingDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import CounselingDetailForm from '../components/counseling/CounselingDetailForm';
import { useCounselingDetail } from '../hooks/useCounselingDetail';

const CounselingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { counselingDetail, loading, error, fetchCounselingDetail } = useCounselingDetail();

  useEffect(() => {
    if (id) {
      fetchCounselingDetail(id);
    }
  }, [id]);

  const handleWriteRecord = () => {
    // 상담일지 작성 페이지로 이동
    navigate(`/counseling/records/write/${id}`);
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다: {error.message}</div>;

  return (
    <>
      <Header />
      
      <article className="container_layout">
        <Sidebar />
        
        <section className="contents">
          <h4 className="board_title">
            <b>{counselingDetail?.name || '홍길동'}</b> 학생의 상담 신청 내역
          </h4>
          
          <CounselingDetailForm 
            data={counselingDetail}
            onWriteRecord={handleWriteRecord}
          />
        </section>
      </article>
      
      <Footer />
    </>
  );
};

export default CounselingDetailPage;