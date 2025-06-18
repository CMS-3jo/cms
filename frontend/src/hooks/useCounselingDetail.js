// src/hooks/useCounselingDetail.js
import { useState, useCallback } from 'react';
import { counselingApi } from '../services/api';

export const useCounselingDetail = () => {
  const [counselingDetail, setCounselingDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 임시 목 데이터
  const mockDetailData = {
    id: 1,
    name: '홍길동',
    category: '학업상담',
    studentId: '2306081223',
    method: '대면상담',
    department: '컴퓨터과학과',
    datetime: '2024-06-10 14:00',
    phone: '01012345678',
    status: '상담완료',
    email: 'hong@nate.com',
    file: '',
    gender: '남',
    content: '학업 진로에 대한 상담을 원합니다. 현재 전공과목에 대한 이해도가 부족하여 도움이 필요합니다.'
  };

  const fetchCounselingDetail = useCallback(async (id) => {
      try {
        setLoading(true);
        setError(null);

        const data = await counselingApi.getCounselingDetail(id);
        setCounselingDetail(data);
      } catch (err) {
        setError(err);
        console.error('상담 상세 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    }, []);

  const updateCounselingDetail = useCallback(async (id, data) => {
    try {
      setLoading(true);
      
      // 임시로 목 데이터 업데이트
      setCounselingDetail(prev => ({ ...prev, ...data }));
      
      return { success: true };

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await counselingApi.updateCounselingDetail(id, data);
      
      if (response.success) {
        setCounselingDetail(response.data);
        return { success: true };
      } else {
        setError(new Error(response.message || '업데이트에 실패했습니다.'));
        return { success: false, error: response.message };
      }
      */
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    counselingDetail,
    loading,
    error,
    fetchCounselingDetail,
    updateCounselingDetail
  };
};