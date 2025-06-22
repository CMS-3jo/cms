// src/components/calendar/WeeklyCalendarComponent.jsx
import React from 'react';

const WeeklyCalendarComponent = ({ 
  currentDate, 
  currentWeek,
  weeklyData, 
  loading, 
  onEventClick, 
  onMoveWeek, 
  onViewSwitch,
  weekInfo // 추가된 prop
}) => {
  
  // 주의 시작일을 계산하는 함수 (useWeeklyCalendar와 동일한 로직)
  const getWeekStart = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // 해당 주의 일요일
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // 주간 제목 생성
  const getWeekTitle = () => {
    const weekStart = getWeekStart(currentDate);
    const month = weekStart.getMonth() + 1;
    const startDate = weekStart.getDate();
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    
    // 같은 달인지 확인
    const isSameMonth = weekStart.getMonth() === endDate.getMonth();
    
    if (isSameMonth) {
      return `${month}월 ${Math.ceil(startDate / 7)}째 주`;
    } else {
      return `${month}월 ${Math.ceil(startDate / 7)}째 주`;
    }
  };

  const renderWeeklyCalendar = () => {
    const weekStart = getWeekStart(currentDate);
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 헤더 생성 (월-금만)
    const dayHeaders = ['시간'];
    const dateArray = [];
    
    // 월요일부터 금요일까지만 표시 (일요일=0, 월요일=1, ..., 금요일=5)
    for (let i = 1; i <= 5; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateStr = date.toISOString().split('T')[0];
      
      dayHeaders.push(`${month}/${day}(${daysOfWeek[i]})`);
      dateArray.push(dateStr);
    }

    // 시간별 행 생성
    const rows = [];
    for (let hour = 9; hour <= 17; hour++) {
      const cells = [`${hour}:00`];
      
      for (let i = 0; i < 5; i++) { // 월-금
        const dateStr = dateArray[i];
        const appointments = weeklyData?.appointments?.[dateStr]?.[hour] || [];
        
        if (appointments.length > 0) {
          const appointment = appointments[0]; // 첫 번째 약속만 표시
          cells.push(
            <td 
              key={i}
              className="appointment" 
              data-date={dateStr} 
              data-hour={hour}
              style={{ backgroundColor: appointment.color || 'skyblue', cursor: 'pointer' }}
              onClick={() => onEventClick(appointment)}
            >
              <div className="student_info">
                <span>{appointment.studentName || appointment.name}</span>
                <span>{appointment.studentId || appointment.studentNo}</span>
              </div>
            </td>
          );
        } else {
          cells.push(
            <td 
              key={i}
              className="empty" 
              data-date={dateStr} 
              data-hour={hour}
            ></td>
          );
        }
      }
      
      rows.push(
        <tr key={hour}>
          <td className="time-column" style={{ paddingTop: '10px' }}>{cells[0]}</td>
          {cells.slice(1)}
        </tr>
      );
    }

    return { dayHeaders, rows };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        주간 캘린더를 불러오는 중...
      </div>
    );
  }

  const { dayHeaders, rows } = renderWeeklyCalendar();

  return (
    <>
      <div className="calendar-header">
        <div className="calendar-header-left">
          <button 
            className="btn" 
            onClick={() => onMoveWeek(-1)} 
            style={{ marginRight: '5px', border: '0' }}
          >
            &lt;
          </button>
          <div className="calendar-title" id="week-title">
            {getWeekTitle()}
          </div>
          <button 
            className="btn" 
            onClick={() => onMoveWeek(1)} 
            style={{ marginLeft: '5px', border: '0' }}
          >
            &gt;
          </button>
        </div>
        <div className="calendar-header-right">
          <button 
            onClick={() => onViewSwitch('monthly')} 
            className="btn btn-outline-success btn-sm" 
            style={{ marginRight: '5px' }}
          >
            월간
          </button>
          <button 
            onClick={() => onViewSwitch('weekly')} 
            className="btn btn-success btn-sm"
          >
            주간
          </button>
        </div>
      </div>
      
      <table className="calendar-table">
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <thead>
          <tr>
            {dayHeaders.map((header, index) => (
              <th key={index} className={index === 0 ? 'time-column' : ''}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody id="appointments">
          {rows}
        </tbody>
      </table>
    </>
  );
};

export default WeeklyCalendarComponent;