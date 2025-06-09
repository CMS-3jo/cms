// src/components/calendar/CalendarComponent.jsx
import React from 'react';

const CalendarComponent = ({ 
  currentDate, 
  calendarData, 
  loading, 
  onEventClick, 
  onChangeMonth, 
  onViewSwitch,
  viewType = 'monthly'
}) => {
  
  const getMonthDays = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDay = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = getMonthDays(year, month);
    const firstDay = getFirstDay(year, month);

    const rows = [];
    let day = 1 - firstDay;

    for (let i = 0; i < 6; i++) {
      const cells = [];
      for (let j = 0; j < 7; j++, day++) {
        if (day < 1 || day > days) {
          cells.push(<td key={j}></td>);
        } else {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = calendarData?.events?.filter(event => 
            event.date === dateStr
          ) || [];

          cells.push(
            <td key={j} data-date={dateStr}>
              {day}
              <br />
              {dayEvents.map((event, index) => (
                <div 
                  key={index}
                  className="event-box" 
                  style={{ backgroundColor: 'skyblue', cursor: 'pointer' }}
                  data-bs-toggle="modal" 
                  data-bs-target="#eventModal"
                  onClick={() => onEventClick(event)}
                >
                  <span>{event.time}</span>
                  <span> {event.studentName}</span>
                </div>
              ))}
            </td>
          );
        }
      }
      rows.push(<tr key={i}>{cells}</tr>);
      if (day > days) break;
    }

    return rows;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onChangeMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onChangeMonth(newDate);
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          캘린더를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="controls">
          <button id="prev-month" onClick={handlePrevMonth}>&lt;</button>
          <div className="title" id="calendar-title">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </div>
          <button id="next-month" onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="view-controls">
          <button 
            className={`btn btn-sm ${viewType === 'monthly' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => onViewSwitch('monthly')}
          >
            월간
          </button>
          <button 
            className={`btn btn-sm ${viewType === 'weekly' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => onViewSwitch('weekly')}
          >
            주간
          </button>
        </div>
      </div>
      
      <table className="calendar">
        <colgroup>
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.3%' }} />
          <col style={{ width: '14.2%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>일</th>
            <th>월</th>
            <th>화</th>
            <th>수</th>
            <th>목</th>
            <th>금</th>
            <th>토</th>
          </tr>
        </thead>
        <tbody id="calendar-body">
          {renderMonthlyCalendar()}
        </tbody>
      </table>
    </div>
  );
};

export default CalendarComponent;