// src/components/calendar/WeeklyCalendarComponent.jsx
import React from 'react';

const WeeklyCalendarComponent = ({ 
  currentDate, 
  currentWeek,
  weeklyData, 
  loading, 
  onEventClick, 
  onMoveWeek, 
  onViewSwitch 
}) => {
  
  const getFirstDayOfWeek = (date, weekOffset) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const firstMonday = new Date(firstDayOfMonth);
    firstMonday.setDate(firstDayOfMonth.getDate() + diff);

    const firstDayOfWeek = new Date(firstMonday.setDate(firstMonday.getDate() + (weekOffset * 7)));
    const utcOffset = firstDayOfWeek.getTimezoneOffset() * 60000;
    return new Date(firstDayOfWeek.getTime() + utcOffset);
  };

  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysFromStart = Math.floor((date - firstDayOfMonth) / (24 * 60 * 60 * 1000));
    return Math.ceil((daysFromStart + firstDayOfMonth.getDay() + 1) / 7);
  };

  const renderWeeklyCalendar = () => {
    const firstDayOfWeek = getFirstDayOfWeek(currentDate, currentWeek);
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 헤더 생성
    const dayHeaders = ['시간'];
    const dateArray = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue; // 토요일과 일요일은 제외
      }
      
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateStr = date.toISOString().split('T')[0];
      
      dayHeaders.push(`${month}/${day}(${daysOfWeek[dayOfWeek]})`);
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
                <span>{appointment.name}</span>
                <span>{appointment.studentNo}</span>
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

  const getWeekTitle = () => {
    const firstDayOfWeek = getFirstDayOfWeek(currentDate, currentWeek);
    const monthName = firstDayOfWeek.toLocaleString('default', { month: 'long' });
    const weekNumber = getWeekNumber(firstDayOfWeek);
    return `${monthName} ${weekNumber}째 주`;
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