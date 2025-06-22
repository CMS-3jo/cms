// src/pages/MonthlyCalendarPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import CalendarComponent from '../components/calendar/CalendarComponent';
import CalendarEventModal from '../components/calendar/CalendarEventModal';
import { useCalendar } from '../hooks/useCalendar';

const MonthlyCalendarPage = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const {
    currentDate,
    calendarData,
    loading,
    error,
    changeMonth,
    updateEvent
  } = useCalendar();

  const handleEventClick = (event) => {
    setSelectedEvent(event);
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
    if (viewType === 'weekly') {
      navigate('/admin/calendar/weekly');
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
        
        <div className="calendar-container">
          <CalendarComponent
            currentDate={currentDate}
            calendarData={calendarData}
            loading={loading}
            onEventClick={handleEventClick}
            onChangeMonth={changeMonth}
            onViewSwitch={handleViewSwitch}
            viewType="monthly"
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

export default MonthlyCalendarPage;