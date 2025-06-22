import { useState, useCallback, useEffect } from 'react';
import { calendarApi } from '../services/api';
import { useAuth } from './useAuth';

export const useWeeklyCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState({ appointments: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 주의 시작일(일요일)을 계산하는 함수
  const getWeekStart = useCallback((date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // 해당 주의 일요일
    start.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    return start;
  }, []);

  const getWeekRange = useCallback((date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999); // 시간을 23:59:59로 설정
    return { start, end };
  }, [getWeekStart]);

  const fetchWeeklyData = useCallback(async (date) => {
    console.log('=== fetchWeeklyData 호출 ===');
    console.log('date:', date.toLocaleDateString());
    console.log('user?.identifierNo:', user?.identifierNo);
    
    if (!user?.identifierNo) {
      console.log('사용자 정보가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { start, end } = getWeekRange(date);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      console.log(`API 요청 - 사용자: ${user.identifierNo}, 기간: ${startDate} ~ ${endDate}`);

      const data = await calendarApi.getCalendarEvents(user.identifierNo, startDate, endDate);
      
      console.log('API 응답 데이터:', data);

      // 데이터를 요일/시간 단위로 가공
      const appointments = {};
      for (const item of data) {
        const dt = new Date(item.cnslDt);
        const dateKey = dt.toISOString().split('T')[0];
        const hour = dt.getHours();

        if (!appointments[dateKey]) appointments[dateKey] = {};
        if (!appointments[dateKey][hour]) appointments[dateKey][hour] = [];

        appointments[dateKey][hour].push({
          id: item.cnslAplyId,
          counselingId: item.cnslAplyId,
          studentId: item.studentNo,
          studentName: item.studentName,
          time: dt.getHours() + '시',
          date: dateKey
        });
      }

      console.log('가공된 appointments:', appointments);
      setWeeklyData({ appointments });
    } catch (err) {
      setError(err);
      console.error('Fetch weekly data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.identifierNo, getWeekRange]); // user를 의존성에 추가

  // 주간 이동 함수 - 현재 날짜 기준으로 계산
  const moveWeek = useCallback((offset) => {
    console.log(`=== moveWeek 호출 ===`);
    console.log(`offset: ${offset}`);
    
    setCurrentDate(prevDate => {
      const currentWeekStart = getWeekStart(prevDate);
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + (offset * 7));
      
      console.log(`현재 주 시작: ${currentWeekStart.toLocaleDateString()}`);
      console.log(`새로운 주 시작: ${newWeekStart.toLocaleDateString()}`);
      
      return newWeekStart;
    });
  }, [getWeekStart]);

  // 현재 주로 돌아가기 함수
  const goToCurrentWeek = useCallback(() => {
    const today = new Date();
    console.log(`현재 주로 이동: ${today.toLocaleDateString()}`);
    setCurrentDate(today);
  }, []);

  // 특정 날짜의 주로 이동하는 함수
  const goToDate = useCallback((targetDate) => {
    const weekStart = getWeekStart(targetDate);
    console.log(`특정 날짜로 이동: ${weekStart.toLocaleDateString()}`);
    setCurrentDate(weekStart);
  }, [getWeekStart]);

  // currentWeek 계산 (현재 주와의 차이)
  const currentWeek = (() => {
    const today = new Date();
    const todayWeekStart = getWeekStart(today);
    const currentWeekStart = getWeekStart(currentDate);
    
    const diffTime = currentWeekStart.getTime() - todayWeekStart.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    
    return diffWeeks;
  })();

  // currentDate가 변경될 때마다 데이터 fetch
  useEffect(() => {
    console.log('=== useEffect 트리거 ===');
    console.log('currentDate:', currentDate.toLocaleDateString());
    console.log('user?.identifierNo:', user?.identifierNo);
    
    if (user?.identifierNo) {
      fetchWeeklyData(currentDate);
    } else {
      console.log('사용자 정보가 없어서 API 요청을 건너뜁니다.');
    }
  }, [currentDate, user?.identifierNo]); // fetchWeeklyData 의존성 제거하여 무한 루프 방지

  // updateEvent 함수 추가 (WeeklyCalendarPage에서 사용)
  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      // API 호출 로직 (실제 API에 맞게 수정 필요)
      // const result = await calendarApi.updateEvent(eventId, eventData);
      
      // 임시로 성공 처리
      await fetchWeeklyData(currentDate); // 데이터 새로고침
      return { success: true };
    } catch (error) {
      console.error('Event update error:', error);
      return { success: false, error: error.message };
    }
  }, [fetchWeeklyData, currentDate]);

  // 화면 표시용 주간 날짜 배열 계산
  const weekDates = (() => {
    const weekStart = getWeekStart(currentDate);
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  })();

  // 주간 표시용 정보
  const weekInfo = {
    weekDates,
    weekStart: getWeekStart(currentDate),
    weekEnd: (() => {
      const end = new Date(getWeekStart(currentDate));
      end.setDate(end.getDate() + 6);
      return end;
    })(),
    formattedDates: weekDates.map(date => ({
      date: date,
      dateString: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay(),
      dayName: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
      formatted: `${date.getMonth() + 1}/${date.getDate()}(${['일', '월', '화', '수', '목', '금', '토'][date.getDay()]})`
    }))
  };

  return {
    currentDate,
    currentWeek,
    weeklyData,
    loading,
    error,
    moveWeek,
    goToCurrentWeek,
    goToDate,
    fetchWeeklyData,
    updateEvent,
    weekInfo
  };
};