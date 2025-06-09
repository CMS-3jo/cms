// src/hooks/useCalendar.js
import { useState, useCallback, useEffect } from 'react';
// import { calendarApi } from '../services/api';

export const useCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)); // 2025년 6월
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 임시 목 데이터 (원본과 동일하게 모든 날짜에 이벤트 추가)
  const mockCalendarData = {
    events: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      date: `2025-06-${String(i + 1).padStart(2, '0')}`,
      time: '10:00',
      studentName: '홍길동',
      studentId: '2306081223',
      department: '컴퓨터과학과',
      phone: '01012345678',
      category: '심리상담',
      method: '대면',
      counselingId: i + 1
    }))
  };

  const fetchCalendarData = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);

      // 임시로 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCalendarData(mockCalendarData);

      // 실제 API 호출 코드 (주석 처리)
      /*
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const response = await calendarApi.getCalendarData(year, month);
      
      if (response.success) {
        setCalendarData(response.data);
      } else {
        setError(new Error(response.message || '캘린더 데이터를 불러오는데 실패했습니다.'));
      }
      */
    } catch (err) {
      setError(err);
      console.error('Fetch calendar data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeMonth = useCallback((newDate) => {
    setCurrentDate(newDate);
    fetchCalendarData(newDate);
  }, [fetchCalendarData]);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      setLoading(true);
      
      // 임시로 목 데이터 업데이트
      setCalendarData(prev => ({
        ...prev,
        events: prev.events.map(event => 
          event.id === eventId ? { ...event, ...eventData } : event
        )
      }));
      
      console.log('Updated event:', { eventId, eventData });
      
      return { success: true };

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await calendarApi.updateEvent(eventId, eventData);
      
      if (response.success) {
        // 캘린더 데이터 다시 불러오기
        await fetchCalendarData(currentDate);
        return { success: true };
      } else {
        setError(new Error(response.message || '일정 수정에 실패했습니다.'));
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

  // 초기 데이터 로드
  useEffect(() => {
    fetchCalendarData(currentDate);
  }, []);

  return {
    currentDate,
    calendarData,
    loading,
    error,
    changeMonth,
    updateEvent,
    fetchCalendarData
  };
};