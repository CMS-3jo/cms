// src/hooks/useCounselingList.jsx
import { useState, useCallback } from 'react';
// import { counselingApi } from '../services/api';

export const useCounselingList = () => {
  const [counselingData, setCounselingData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 임시 목 데이터
  const mockData = [
    {
      id: 1,
      status: '상담완료',
      name: '홍길동',
      gender: '남',
      studentId: '2306081223',
      email: 'hong@nate.com',
      phone: '01012345678'
    },
    {
      id: 2,
      status: '상담중지',
      name: '김영희',
      gender: '여',
      studentId: '2306081224',
      email: 'kim@nate.com',
      phone: '01012345679'
    },
    {
      id: 3,
      status: '상담대기',
      name: '박철수',
      gender: '남',
      studentId: '2306081225',
      email: 'park@nate.com',
      phone: '01012345680'
    }
  ];

  const fetchCounselingList = useCallback(async ({ 
    page = 1, 
    search = '', 
    category = '모두보기', 
    limit = 10 
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      // 임시로 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 필터링 로직
      let filteredData = mockData;
      
      if (category !== '모두보기') {
        filteredData = mockData.filter(item => item.status === category);
      }
      
      if (search) {
        filteredData = filteredData.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 페이지네이션 로직
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setCounselingData(paginatedData);
      setTotalCount(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / limit));

      // 실제 API 호출 코드 (주석 처리)
      /*
      const params = {
        page,
        limit,
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
      */
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
      
      // 임시로 목 데이터 업데이트
      const updatedData = counselingData.map(item => 
        item.id === id ? { ...item, status } : item
      );
      setCounselingData(updatedData);
      
      return { success: true };
      
      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await counselingApi.updateCounselingStatus(id, status);
      
      if (response.success) {
        await fetchCounselingList();
        return { success: true };
      } else {
        setError(new Error(response.message || '상태 업데이트에 실패했습니다.'));
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