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
  weekInfo
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
   
    // 월~금 요일만 필터링 (1=월요일, 2=화요일, ..., 5=금요일)
    const weekdayDates = weekInfo.formattedDates.filter(d => d.dayOfWeek >= 1 && d.dayOfWeek <= 5);
    
    // 헤더와 날짜 배열 생성
    const dayHeaders = ['시간', ...weekdayDates.map(d => d.formatted)];
    const dateArray = weekdayDates.map(d => d.dateString);
    
    // 시간별 행 생성
    const rows = [];
    for (let hour = 9; hour <= 17; hour++) {
      const cells = [`${hour}:00`];
      
      // 각 요일(월~금)에 대해 셀 생성
      for (let i = 0; i < dateArray.length; i++) {
        const dateStr = dateArray[i];
        const hourStr = hour.toString();
        
        // 해당 날짜의 데이터 찾기
        let appointments = [];
        const dateData = weeklyData?.appointments?.[dateStr];
        
        if (dateData) {
          // 다양한 시간 키 형태 시도 (문자열 "9", 숫자 9 등)
          appointments = dateData[hourStr] || dateData[hour] || dateData[hour.toString().padStart(2, '0')] || [];
        }
        
        if (appointments.length > 0) {
          const appointment = appointments[0];
          cells.push(
            <td 
              key={`${dateStr}-${hour}`}
              className="appointment" 
              data-date={dateStr} 
              data-hour={hour}
              style={{ backgroundColor: appointment.color || 'skyblue'}}
              
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
              key={`${dateStr}-${hour}`}
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
	<style jsx>{`
	  .calendar-table {
	    width: 100%;
	    border-collapse: collapse;
	    border-radius: 12px;
	    overflow: hidden;
	    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	  }

	  .calendar-table thead th {
	    background: #2563eb;
	    color: white;
	    padding: 12px;
	    text-align: center;
	    font-weight: 600;
	    font-size: 14px;
	  }

	  .calendar-table tbody td {
	    border: 1px solid #e9ecef;
	    height: 64px;
	    text-align: center;
	    vertical-align: middle;
	    padding: 8px;
	    transition: background 0.2s ease;
	  }

	  .calendar-table tbody td.empty {
	    background: #f8f9fa;
	  }

	  .calendar-table tbody td.appointment {
	    background: #10b981;
	    color: white;
	    cursor: pointer;
	    border-radius: 6px;
	    transition: all 0.2s ease;
	  }

	  .calendar-table tbody td.appointment:hover {
	    background: #059669;
	    transform: translateY(-1px);
	  }

	  .student_info {
	    display: flex;
	    flex-direction: column;
	    align-items: center;
	    font-size: 12px;
	    line-height: 1.3;
	    gap: 2px;
	  }

	  .calendar-header {
	    display: flex;
	    justify-content: space-between;
	    align-items: center;
	    margin-bottom: 24px;
	    padding: 0 8px;
	  }

	  .controls {
	    display: flex;
	    align-items: center;
	    gap: 16px;
	  }

	  .controls button {
	    width: 40px;
	    height: 40px;
	    border: none;
	    border-radius: 50%;
	    background: #f8f9fa;
	    color: #495057;
	    cursor: pointer;
	    display: flex;
	    align-items: center;
	    justify-content: center;
	    font-size: 18px;
	    font-weight: 600;
	    transition: all 0.2s ease;
	  }

	  .controls button:hover {
	    background: #e9ecef;
	    transform: translateY(-1px);
	  }

	  .title {
	    font-size: 24px;
	    font-weight: 700;
	    color: #2c3e50;
	    margin: 0 16px;
	    min-width: 180px;
	    text-align: center;
	  }

	  .view-controls {
	    display: flex;
	    gap: 8px;
	  }

	  .view-controls button {
	    padding: 8px 16px;
	    border: 2px solid #28a745;
	    border-radius: 8px;
	    background: transparent;
	    color: #28a745;
	    cursor: pointer;
	    font-weight: 500;
	    transition: all 0.2s ease;
	  }

	  .view-controls button.active {
	    background: #28a745 !important;
	    color: white;
	  }

	  .view-controls button:hover {
	    background: #28a745;
	    color: white;
	    transform: translateY(-1px);
	  }

	  @media (max-width: 768px) {
	    .calendar-header {
	      flex-direction: column;
	      align-items: stretch;
	      gap: 12px;
	    }

	    .calendar-title {
	      font-size: 18px;
	    }

	    .calendar-table thead th,
	    .calendar-table tbody td {
	      font-size: 12px;
	      padding: 6px;
	    }
	  }
	`}</style>
	<div className="calendar-header">
	  <div className="controls">
	    <button className="nav-btn" onClick={() => onMoveWeek(-1)}>‹</button>
	    <div className="title">{getWeekTitle()}</div>
	    <button className="nav-btn" onClick={() => onMoveWeek(1)}>›</button>
	  </div>
	  <div className="view-controls">
		  <button
		    onClick={() => onViewSwitch('monthly')}
		    className="btn btn-outline-success btn-sm"
		  >
		    월간
		  </button>
		  <button
		    onClick={() => onViewSwitch('weekly')}
		    className="btn btn-success btn-sm active"
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