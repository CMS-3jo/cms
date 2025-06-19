// src/hooks/useCounselingRecord.js
import { useState, useCallback } from 'react';
import { counselingApi } from '../services/api';

export const useCounselingRecord = () => {
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecord = useCallback(async (counselingId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await counselingApi.getCounselingRecord(counselingId);

      if (!response) {
        setRecordData(null); // 상담일지 없음
        return;
      }

      setRecordData(response); // response = { savedTitle, savedContent, savedTime }

    } catch (err) {
      setError(err);
      console.error('Fetch record error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRecord = useCallback(async (counselingId, recordData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await counselingApi.saveCounselingRecord(counselingId, recordData);

      if (response.success) {
        return { success: true };
      } else {
        setError(new Error(response.message || '일지 저장에 실패했습니다.'));
        return { success: false, error: response.message };
      }

    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSchedule = useCallback(async (scheduleData) => {
    try {
      setLoading(true);
      setError(null);

      // 임시로 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 임시로 성공 처리
      console.log('Saved schedule:', scheduleData);
      
      return { success: true };

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await counselingApi.saveSchedule(scheduleData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(new Error(response.message || '일정 등록에 실패했습니다.'));
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
    recordData,
    loading,
    error,
    fetchRecord,
    saveRecord,
    saveSchedule
  };
};