// src/components/calendar/CalendarEventModal.jsx
import React, { useState, useEffect } from 'react';

const CalendarEventModal = ({ event, onUpdate, onWriteRecord, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [eventData, setEventData] = useState({
    date: '',
    time: '',
    ...event
  });

  useEffect(() => {
    // 모달이 열릴 때 body에 modal-open 클래스 추가
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleInputChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModify = () => {
    if (isEditing) {
      // 수정 저장
      if (!eventData.date || !eventData.time) {
        alert('날짜와 시간을 모두 입력해주세요.');
        return;
      }
      onUpdate(eventData);
    } else {
      // 수정 모드로 전환
      setIsEditing(true);
    }
  };

  const timeOptions = [
    { value: '', label: '시간을 선택해주세요', disabled: true },
    { value: '09:00:00', label: '09:00' },
    { value: '10:00:00', label: '10:00' },
    { value: '11:00:00', label: '11:00' },
    { value: '12:00:00', label: '12:00' },
    { value: '', label: '== 점심시간 ==', disabled: true },
    { value: '14:00:00', label: '14:00' },
    { value: '15:00:00', label: '15:00' },
    { value: '16:00:00', label: '16:00' },
    { value: '17:00:00', label: '17:00' }
  ];

  return (
    <div 
      className="modal fade show" 
      id="eventModal"
      tabIndex="-1" 
      aria-labelledby="eventModalLabel"
      aria-hidden="false"
      style={{ 
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050
      }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="eventModalLabel">상담 일정</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            >
              <img alt="닫기" src="/images/close.svg" />
            </button>
          </div>
          
          <div className="modal-body" id="modal-event-details">
            <table className="form_write">
              <tbody>
                <tr>
                  <td><label>이름</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.studentName || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>학번</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.studentId || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="department">학과</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.department || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="contact">연락처</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.phone || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="appointmentTime">상담 일시</label></td>
                  <td>
                    {!isEditing ? (
                      <div style={{ display: 'flex' }}>
                        <input 
                          type="text" 
                          id="consultationDate"
                          value={`${eventData.date} ${eventData.time}`} 
                          readOnly 
                        />
                        <input 
                          type="button" 
                          id="changeDate"
                          value="변경하기" 
                          className="btn btn-secondary"
                          onClick={() => setIsEditing(true)}
                        />
                      </div>
                    ) : (
                      <div id="newDate" style={{ display: 'block' }}>
                        <input 
                          type="date" 
                          style={{ height: '45px', marginRight: '5px' }}
                          id="new_date"
                          value={eventData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                        />
                        <select 
                          id="new_time"
                          value={eventData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                        >
                          {timeOptions.map((option, index) => (
                            <option 
                              key={index} 
                              value={option.value} 
                              disabled={option.disabled}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td><label>상담분류</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.category || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label>상담방식</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={eventData.method || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="modal-footer" id="modal-event-footers">
            <a 
              href="#"
              className="btn btn-secondary" 
              id="record"
              onClick={(e) => {
                e.preventDefault();
                onWriteRecord();
              }}
            >
              상담일지 쓰기
            </a>
            <input 
              type="button" 
              id="monthlyModify"
              className="btn btn-success" 
              value={isEditing ? "저장" : "수정"}
              onClick={handleModify}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;