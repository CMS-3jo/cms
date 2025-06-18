// src/hooks/useCounselingList.jsx
import { useState, useCallback } from 'react';
import { counselingApi } from '../services/api';

export const useCounselingList = () => {
  const [counselingData, setCounselingData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCounselingList = useCallback(async ({
    page = 1,
    search = '',
    category = '모두보기',
    limit = 10
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page - 1, // 백엔드는 0부터 시작
        size: limit,
        ...(search && { search }),
        ...(category !== '모두보기' && { status: category })
      };

      const response = await counselingApi.getCounselingList(params);

      if (response.success) {
        setCounselingData(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError(new Error(response.message || '데이터를 불러오는데 실패했습니다.'));
      }
    } catch (err) {
      setError(err);
      console.error('Fetch counseling list error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCounselingStatus = useCallback(async (id, status) => {
    try {
      setLoading(true);

      const response = await counselingApi.updateCounselingStatus(id, status);

      if (response.success) {
        await fetchCounselingList(); // 갱신
        return { success: true };
      } else {
        setError(new Error(response.message || '상태 업데이트에 실패했습니다.'));
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchCounselingList]);

  const deleteCounseling = useCallback(async (id) => {
    try {
      setLoading(true);
      
      // 임시로 목 데이터에서 삭제
      const updatedData = counselingData.filter(item => item.id !== id);
      setCounselingData(updatedData);
      setTotalCount(updatedData.length);
      
      return { success: true };
      
      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await counselingApi.deleteCounseling(id);
      
      if (response.success) {
        await fetchCounselingList();
        return { success: true };
      } else {
        setError(new Error(response.message || '삭제에 실패했습니다.'));
        return { success: false, error: response.message };
      }
      */
    } catch (err) {
      setError(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [counselingData]);

  return {
    counselingData,
    totalCount,
    totalPages,
    loading,
    error,
    fetchCounselingList,
    updateCounselingStatus,
    deleteCounseling
  };
};