import React, { useState } from 'react';

const CalendarComponent = ({
	currentDate = new Date(),
	calendarData = { events: [] },
	loading = false,
	onEventClick = () => { },
	onChangeMonth = () => { },
	onViewSwitch = () => { },
	viewType = 'monthly',
	counselorId = null
}) => {

	const getMonthDays = (year, month) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDay = (year, month) => {
		return new Date(year, month, 1).getDay();
	};

	const getWeekDates = (date) => {
		const startOfWeek = new Date(date);
		const day = startOfWeek.getDay();
		startOfWeek.setDate(startOfWeek.getDate() - day);
		
		const weekDates = [];
		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(startOfWeek);
			currentDate.setDate(startOfWeek.getDate() + i);
			weekDates.push(currentDate);
		}
		return weekDates;
	};

	const renderMonthlyCalendar = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const days = getMonthDays(year, month);
		const firstDay = getFirstDay(year, month);
		const today = new Date();
		const isToday = (day) => {
			return today.getFullYear() === year &&
				today.getMonth() === month &&
				today.getDate() === day;
		};

		const rows = [];
		let day = 1 - firstDay;

		for (let i = 0; i < 6; i++) {
			const cells = [];
			for (let j = 0; j < 7; j++, day++) {
				if (day < 1 || day > days) {
					cells.push(
						<td key={j} className="calendar-cell empty-cell">
							<div className="date-content"></div>
						</td>
					);
				} else {
					const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
					const dayEvents = calendarData?.events?.filter(event =>
						event.date === dateStr &&
						(!counselorId || event.assignedCounselorId === counselorId)
					) || [];

					cells.push(
						<td key={j} className={`calendar-cell ${isToday(day) ? 'today' : ''}`} data-date={dateStr}>
							<div className="date-content">
								<div className={`date-number ${isToday(day) ? 'today-number' : ''}`}>
									{day}
								</div>
								<div className="events-container">
									{dayEvents.slice(0, 3).map((event, index) => (
										<div
											key={index}
											className="event-item"
											onClick={() => onEventClick(event)}
											title={`${event.time} - ${event.studentName}`}
										>
											<span className="event-time">{event.time}</span>
											<span className="event-name">{event.studentName}</span>
										</div>
									))}
									{dayEvents.length > 3 && (
										<div className="more-events">
											+{dayEvents.length - 3} more
										</div>
									)}
								</div>
							</div>
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
		if (viewType === 'weekly') {
			newDate.setDate(newDate.getDate() - 7);
		} else {
			newDate.setMonth(newDate.getMonth() - 1);
		}
		onChangeMonth(newDate);
	};

	const handleNextMonth = () => {
		const newDate = new Date(currentDate);
		if (viewType === 'weekly') {
			newDate.setDate(newDate.getDate() + 7);
		} else {
			newDate.setMonth(newDate.getMonth() + 1);
		}
		onChangeMonth(newDate);
	};

	const handleViewSwitch = (newViewType) => {
		onViewSwitch(newViewType);
	};

	if (loading) {
		return (
			<div className="calendar-container">
				<div className="loading-container">
					<div className="loading-spinner"></div>
					<p>캘린더를 불러오는 중...</p>
				</div>
			</div>
		);
	}

	const getWeekRange = () => {
		const weekDates = getWeekDates(currentDate);
		const start = weekDates[0];
		const end = weekDates[6];
		return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
	};

	return (
		<div className="calendar-container">
			<style jsx>{`
        .calendar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
          background: #28a745;
          color: white;
        }

        .view-controls button:hover {
          background: #28a745;
          color: white;
          transform: translateY(-1px);
        }

        .calendar {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		  display: inline-table;
        }

        .calendar thead th {
          background: #2563eb;
          color: white;
          padding: 16px 8px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          border: none;
        }

        .calendar thead th:first-child {
          color: #ff6b6b;
        }

        .calendar thead th:last-child {
          color: #4ecdc4;
        }

        .calendar-cell {
          border: 1px solid #e9ecef;
          vertical-align: top;
          height: 120px;
          padding: 0;
          position: relative;
          background: white;
          transition: all 0.2s ease;
        }

        .calendar-cell:hover {
          background: #f8f9fa;
        }

        .calendar-cell.today {
          background: #eff6ff;
          border-color: #2563eb;
        }

        .calendar-cell.empty-cell {
          background: #fafafa;
          border-color: #f1f3f4;
        }

        .date-content {
          height: 100%;
          padding: 8px;
          display: flex;
          flex-direction: column;
        }

        .date-number {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
          text-align: center;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .date-number.today-number {
          background: #2563eb;
          color: white;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .events-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }

        .event-item {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .event-item:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .event-item:nth-child(2n) {
          background: #8b5cf6;
        }

        .event-item:nth-child(2n):hover {
          background: #7c3aed;
        }

        .event-item:nth-child(3n) {
          background: #f59e0b;
        }

        .event-item:nth-child(3n):hover {
          background: #d97706;
        }

        .event-time {
          font-weight: 600;
          font-size: 10px;
          opacity: 0.9;
        }

        .event-name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-events {
          font-size: 10px;
          color: #6c757d;
          text-align: center;
          padding: 2px;
          background: #f8f9fa;
          border-radius: 4px;
          margin-top: 2px;
        }

        /* 주간 캘린더 스타일 */
        .weekly-calendar {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .weekly-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: #2563eb;
        }

        .weekly-day-header {
          padding: 16px 8px;
          text-align: center;
          color: white;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .weekly-day-header:last-child {
          border-right: none;
        }

        .weekly-day-header.today {
          background: #1d4ed8;
        }

        .weekly-day-header:first-child {
          color: #ff6b6b;
        }

        .weekly-day-header:last-child {
          color: #4ecdc4;
        }

        .day-name {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .day-number {
          font-size: 18px;
          font-weight: 700;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border-radius: 50%;
        }

        .day-number.today-number {
          background: white;
          color: #2563eb;
        }

        .weekly-content {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          min-height: 400px;
        }

        .weekly-day {
          border-right: 1px solid #e9ecef;
          padding: 12px 8px;
          min-height: 400px;
        }

        .weekly-day:last-child {
          border-right: none;
        }

        .weekly-day.today {
          background: #eff6ff;
        }

        .weekly-events {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .weekly-event-item {
          background: #10b981;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          line-height: 1.3;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .weekly-event-item:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .weekly-event-item:nth-child(2n) {
          background: #8b5cf6;
        }

        .weekly-event-item:nth-child(2n):hover {
          background: #7c3aed;
        }

        .weekly-event-item:nth-child(3n) {
          background: #f59e0b;
        }

        .weekly-event-item:nth-child(3n):hover {
          background: #d97706;
        }

        .weekly-event-item .event-time {
          font-weight: 600;
          font-size: 11px;
          opacity: 0.9;
          margin-bottom: 2px;
        }

        .weekly-event-item .event-name {
          font-weight: 500;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2563eb;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .calendar-container {
            padding: 16px;
            margin: 16px;
          }

          .calendar-header {
            flex-direction: column;
            gap: 16px;
          }

          .title {
            font-size: 20px;
          }

          .calendar-cell {
            height: 100px;
          }

          .date-content {
            padding: 4px;
          }

          .event-item {
            padding: 2px 4px;
            font-size: 10px;
          }

          .weekly-content {
            grid-template-columns: 1fr;
          }

          .weekly-day {
            border-right: none;
            border-bottom: 1px solid #e9ecef;
            min-height: auto;
            padding: 8px;
          }

          .weekly-header {
            grid-template-columns: 1fr;
          }

          .weekly-day-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            text-align: left;
          }
        }
      `}</style>

			<div className="calendar-header">
				<div className="controls">
					<button onClick={handlePrevMonth}>‹</button>
					<div className="title">
						{viewType === 'weekly' 
							? `${currentDate.getFullYear()}년 ${getWeekRange()}`
							: `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`
						}
					</div>
					<button onClick={handleNextMonth}>›</button>
				</div>
				<div className="view-controls">
					<button
						className={viewType === 'monthly' ? 'active' : ''}
						onClick={() => handleViewSwitch('monthly')}
					>
						월간
					</button>
					<button
						className={viewType === 'weekly' ? 'active' : ''}
						onClick={() => handleViewSwitch('weekly')}
					>
						주간
					</button>
				</div>
			</div>

			{viewType === 'weekly' ? (
				renderWeeklyCalendar()
			) : (
				<table className="calendar">
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
					<tbody>
						{renderMonthlyCalendar()}
					</tbody>
				</table>
			)}
		</div>
	);
};

export default CalendarComponent;