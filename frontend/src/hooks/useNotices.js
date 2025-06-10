// src/hooks/useNotices.js
import { useState, useCallback } from 'react';
// import { noticeApi } from '../services/api';

export const useNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 임시 목 데이터
  const mockNotices = [
    {
      id: 1,
      title: '2025년 1학기 상담 일정 안내',
      content: '2025년 1학기 상담 일정을 안내드립니다.',
      createdDate: '2025-06-01'
    },
    {
      id: 2,
      title: '여름휴가 기간 상담 운영 안내',
      content: '여름휴가 기간 중 상담 운영에 대해 안내드립니다.',
      createdDate: '2025-05-28'
    },
    {
      id: 3,
      title: '온라인 상담 시스템 업데이트',
      content: '온라인 상담 시스템이 업데이트되었습니다.',
      createdDate: '2025-05-25'
    }
  ];

  const fetchNotices = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      // 임시로 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNotices(mockNotices);

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await noticeApi.getNotices(params);
      
      if (response.success) {
        setNotices(response.data.items);
      } else {
        setError(new Error(response.message || '공지사항을 불러오는데 실패했습니다.'));
      }
      */
    } catch (err) {
      setError(err);
      console.error('Fetch notices error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNotice = useCallback(async (noticeData) => {
    try {
      setLoading(true);
      
      // 임시로 목 데이터에 추가
      const newNotice = {
        id: Date.now(),
        ...noticeData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      
      setNotices(prev => [newNotice, ...prev]);
      
      return { success: true };

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await noticeApi.createNotice(noticeData);
      
      if (response.success) {
        await fetchNotices();
        return { success: true };
      } else {
        setError(new Error(response.message || '공지사항 등록에 실패했습니다.'));
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
    notices,
    loading,
    error,
    fetchNotices,
    createNotice
  };
};