// src/pages/WeeklyCalendarPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import WeeklyCalendarComponent from '../components/calendar/WeeklyCalendarComponent';
import CalendarEventModal from '../components/calendar/CalendarEventModal';
import { useWeeklyCalendar } from '../hooks/useWeeklyCalendar';
import { useAuth } from '../hooks/useAuth';

const WeeklyCalendarPage = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const counselorId = user?.emplNo;
  
  const {
    currentDate,
    currentWeek,
    weeklyData,
    loading,
    error,
    moveWeek,
    updateEvent,
    weekInfo
  } = useWeeklyCalendar();

  const handleEventClick = (appointment) => {
    setSelectedEvent(appointment);
    setShowModal(true);
  };

  const handleEventUpdate = async (eventData) => {
    const result = await updateEvent(selectedEvent.id, eventData);
    if (result.success) {
      alert('일정이 수정되었습니다.');
      setShowModal(false);
    } else {
      alert('수정 실패: ' + result.error);
    }
  };

  const handleWriteRecord = () => {
    if (selectedEvent) {
      navigate(`/counseling/records/write/${selectedEvent.counselingId}`);
    }
  };

  const handleViewSwitch = (viewType) => {
    if (viewType === 'monthly') {
      navigate('/admin/calendar/monthly');
    }
  };

  if (error) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }


  return (
    <>
      <Header />
      
      <div className="container_layout">
        <Sidebar />
        
        <div className="calendar">
          <WeeklyCalendarComponent
            currentDate={currentDate}
            currentWeek={currentWeek}
            weeklyData={weeklyData}
            loading={loading}
            onEventClick={handleEventClick}
            onMoveWeek={moveWeek}
            onViewSwitch={handleViewSwitch}
            counselorId={counselorId}
            weekInfo={weekInfo}
          />
        </div>
      </div>

      {showModal && selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          onUpdate={handleEventUpdate}
          onWriteRecord={handleWriteRecord}
          onClose={() => setShowModal(false)}
        />
      )}
      
      <Footer />
    </>
  );
};

export default WeeklyCalendarPage;