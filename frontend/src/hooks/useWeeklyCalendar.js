// src/hooks/useWeeklyCalendar.js
import { useState, useCallback, useEffect } from 'react';
// import { calendarApi } from '../services/api';

export const useWeeklyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 임시 목 데이터 (weeklyCalendar.js 로직을 React로 변환)
  const mockWeeklyData = {
    appointments: {
      '2025-06-02': {
        10: [{
          id: 1,
          name: '홍길동',
          studentNo: '2306081223',
          studentId: '2306081223',
          department: '컴퓨터과학과',
          phone: '01012345678',
          category: '심리상담',
          method: '대면',
          counselingId: 1,
          color: 'skyblue'
        }],
        14: [{
          id: 2,
          name: '김영희',
          studentNo: '2306081224',
          studentId: '2306081224',
          department: '경영학과',
          phone: '01012345679',
          category: '진로상담',
          method: '비대면',
          counselingId: 2,
          color: 'lightgreen'
        }]
      },
      '2025-06-03': {
        11: [{
          id: 3,
          name: '박철수',
          studentNo: '2306081225',
          studentId: '2306081225',
          department: '영어영문학과',
          phone: '01012345680',
          category: '학업상담',
          method: '대면',
          counselingId: 3,
          color: 'lightcoral'
        }]
      },
      '2025-06-04': {
        15: [{
          id: 4,
          name: '이미영',
          studentNo: '2306081226',
          studentId: '2306081226',
          department: '심리학과',
          phone: '01012345681',
          category: '위기상담',
          method: '대면',
          counselingId: 4,
          color: 'lightyellow'
        }]
      }
    }
  };

  const getInitialWeek = useCallback(() => {
    const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const dayOfWeek = firstDayOfCurrentMonth.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const firstMondayOfMonth = new Date(firstDayOfCurrentMonth);
    firstMondayOfMonth.setDate(firstDayOfCurrentMonth.getDate() + diff);
    const today = new Date();
    const daysFromFirstMonday = Math.floor((today - firstMondayOfMonth) / (24 * 60 * 60 * 1000));
    const initialWeek = Math.floor(daysFromFirstMonday / 7);
    setCurrentWeek(initialWeek);
  }, [currentDate]);

  const fetchWeeklyData = useCallback(async (date, week) => {
    try {
      setLoading(true);
      setError(null);

      // 임시로 1초 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeeklyData(mockWeeklyData);

      // 실제 API 호출 코드 (주석 처리)
      /*
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      const response = await calendarApi.getWeeklyData(year, month, week);
      
      if (response.success) {
        setWeeklyData(response.data);
      } else {
        setError(new Error(response.message || '주간 캘린더 데이터를 불러오는데 실패했습니다.'));
      }
      */
    } catch (err) {
      setError(err);
      console.error('Fetch weekly data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const moveWeek = useCallback((offset) => {
    const newWeek = currentWeek + offset;
    setCurrentWeek(newWeek);
    fetchWeeklyData(currentDate, newWeek);
  }, [currentWeek, currentDate, fetchWeeklyData]);

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      setLoading(true);
      
      // 임시로 목 데이터 업데이트
      setWeeklyData(prev => {
        const updated = { ...prev };
        // 간단한 업데이트 로직 (실제로는 더 복잡할 수 있음)
        Object.keys(updated.appointments).forEach(date => {
          Object.keys(updated.appointments[date]).forEach(hour => {
            updated.appointments[date][hour] = updated.appointments[date][hour].map(appointment =>
              appointment.id === eventId ? { ...appointment, ...eventData } : appointment
            );
          });
        });
        return updated;
      });
      
      console.log('Updated weekly event:', { eventId, eventData });
      
      return { success: true };

      // 실제 API 호출 코드 (주석 처리)
      /*
      const response = await calendarApi.updateWeeklyEvent(eventId, eventData);
      
      if (response.success) {
        await fetchWeeklyData(currentDate, currentWeek);
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
    getInitialWeek();
  }, [getInitialWeek]);

  useEffect(() => {
    if (currentWeek !== null) {
      fetchWeeklyData(currentDate, currentWeek);
    }
  }, [currentWeek, currentDate, fetchWeeklyData]);

  return {
    currentDate,
    currentWeek,
    weeklyData,
    loading,
    error,
    moveWeek,
    updateEvent,
    fetchWeeklyData
  };
};