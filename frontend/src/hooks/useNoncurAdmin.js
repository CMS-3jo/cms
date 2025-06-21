import { useState, useCallback } from 'react';

export const useNoncurAdmin = () => {
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = '/api/admin/noncur';

  // 프로그램 목록 조회
  const fetchPrograms = useCallback(async (deptCd = null, page = 0, size = 10) => {
    setLoading(true);
    try {
      const url = deptCd 
        ? `${API_BASE_URL}/departments/${deptCd}/programs`
        : '/api/noncur';
      
      const response = await fetch(`${url}?page=${page}&size=${size}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('프로그램 목록 조회 실패');
      
      const data = await response.json();
      setPrograms(data.programs || data.content || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('프로그램 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 신청자 목록 조회 - prgId 필수 파라미터로 수정
  const fetchApplications = useCallback(async (prgId, page = 0, size = 10, statusCd = null) => {
    // prgId 유효성 검사 추가
    if (!prgId) {
      const errorMsg = 'prgId는 필수 파라미터입니다.';
      setError(new Error(errorMsg));
      console.error('신청자 목록 조회 실패:', errorMsg);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        size: size.toString() 
      });
      if (statusCd) params.append('statusCd', statusCd);
      
      // 🔥 올바른 URL 구성
      const response = await fetch(`${API_BASE_URL}/${prgId}/applications?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: 신청자 목록 조회 실패`);
      }
      
      const data = await response.json();
      setApplications(data.applications || []);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('신청자 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 통계 조회 - 파라미터 처리 개선
  const fetchStatistics = useCallback(async (deptCd = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (deptCd) params.append('deptCd', deptCd);
      
      const url = `${API_BASE_URL}/statistics${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '통계 조회 실패');
      }
      
      const data = await response.json();
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('통계 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 신청 상태 변경 - 에러 처리 개선
  const updateApplicationStatus = useCallback(async (aplyId, statusCd, rejectReason = null) => {
    if (!aplyId || !statusCd) {
      throw new Error('aplyId와 statusCd는 필수 파라미터입니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${aplyId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ statusCd, rejectReason })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '상태 변경 실패');
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // 🔥 프로그램 상태 변경 - 에러 처리 개선
  const updateProgramStatus = useCallback(async (prgId, statusCd) => {
    if (!prgId || !statusCd) {
      throw new Error('prgId와 statusCd는 필수 파라미터입니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${prgId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ statusCd })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '프로그램 상태 변경 실패');
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // 🔥 이수완료 처리 - 에러 처리 개선
  const completeApplication = useCallback(async (aplyId) => {
    if (!aplyId) {
      throw new Error('aplyId는 필수 파라미터입니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications/${aplyId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '이수완료 처리 실패');
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // 🔥 일괄 상태 변경 - 에러 처리 개선
  const batchUpdateStatus = useCallback(async (aplyIds, statusCd) => {
    if (!aplyIds || !Array.isArray(aplyIds) || aplyIds.length === 0) {
      throw new Error('aplyIds는 필수이며 비어있지 않은 배열이어야 합니다.');
    }
    if (!statusCd) {
      throw new Error('statusCd는 필수 파라미터입니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications/batch-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ aplyIds, statusCd })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '일괄 상태 변경 실패');
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  // 🔥 일괄 이수완료 처리 - 에러 처리 개선
  const batchCompleteApplications = useCallback(async (aplyIds) => {
    if (!aplyIds || !Array.isArray(aplyIds) || aplyIds.length === 0) {
      throw new Error('aplyIds는 필수이며 비어있지 않은 배열이어야 합니다.');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/applications/batch-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ aplyIds })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '일괄 이수완료 처리 실패');
      }
      
      return await response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return {
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
    batchCompleteApplications
  };
};