import { calendarApi } from '../services/api';
import { useAuth } from './useAuth'; // 로그인 상담사 ID 얻기
import { useState, useCallback, useEffect } from 'react';

export const useCalendar = () => {
  const { user } = useAuth(); // 로그인한 상담사 정보
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalendarData = useCallback(async (date) => {
    if (!user?.identifierNo) return;
    try {
      setLoading(true);
      setError(null);

	  const year = date.getFullYear();
	  const month = date.getMonth();

	  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
	  const lastDay = new Date(year, month + 1, 0).getDate(); // 30, 31 등 구해짐
	  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const data = await calendarApi.getCalendarEvents(user.identifierNo, startDate, endDate);

      // 데이터 가공 (LocalDateTime → date + time 분리)
      const events = data.map(item => {
        const dt = new Date(item.cnslDt);
        return {
			date: dt.toISOString().split('T')[0],
		    time: dt.toTimeString().slice(0, 5),
		    studentName: item.studentName ?? item.studentNo ?? '(이름없음)',
		    assignedCounselorId: item.counselorId,
		    counselingId: item.cnslAplyId
        };
      });

      setCalendarData({ events });
	  console.log('[Calendar Events]', events);
    } catch (err) {
      setError(err);
      console.error('Fetch calendar data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  const changeMonth = useCallback((newDate) => {
    setCurrentDate(newDate);
    fetchCalendarData(newDate);
  }, [fetchCalendarData]);

  useEffect(() => {
    fetchCalendarData(currentDate);
  }, [fetchCalendarData, currentDate]);

  return {
    currentDate,
    calendarData,
    loading,
    error,
    changeMonth,
    fetchCalendarData
  };
};
