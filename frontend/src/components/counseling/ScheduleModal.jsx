// src/components/counseling/ScheduleModal.jsx
import React, { useState, useEffect } from 'react';

const ScheduleModal = ({ studentData, onSave, onClose }) => {
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    category: '심리상담',
    method: '대면',
    content: ''
  });

  useEffect(() => {
    // 모달이 열릴 때 body에 modal-open 클래스 추가 (Bootstrap 스타일)
    document.body.classList.add('modal-open');
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleInputChange = (field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!scheduleData.date || !scheduleData.time || !scheduleData.content) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    onSave({
      ...scheduleData,
      studentId: studentData?.studentId,
      studentName: studentData?.name
    });
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
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-hidden="false">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">상담 일정 등록</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            >
              <img alt="닫기" src="/images/close.svg" />
            </button>
          </div>
          
          <div className="modal-body">
            <table className="form_write">
              <tbody>
                <tr>
                  <td><label htmlFor="name">이름</label></td>
                  <td>
                    <input 
                      type="text" 
                      id="student_name" 
                      value={studentData?.name || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="studentId">학번</label></td>
                  <td>
                    <input 
                      type="text" 
                      value={studentData?.studentId || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="department">학과</label></td>
                  <td>
                    <input 
                      type="text" 
                      id="student_major" 
                      value={studentData?.department || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="contact">연락처</label></td>
                  <td>
                    <input 
                      type="text" 
                      id="student_tel_no" 
                      value={studentData?.phone || ''} 
                      readOnly 
                    />
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="appointmentTime">상담 일시</label></td>
                  <td>
                    <div style={{ display: 'flex' }}>
                      <input 
                        type="date" 
                        style={{ height: '45px', marginRight: '5px' }} 
                        id="new_date"
                        value={scheduleData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                      <select 
                        id="new_time"
                        value={scheduleData.time}
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
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="consultationType">상담 분류</label></td>
                  <td>
                    <select 
                      id="new_consultation_category" 
                      style={{ width: '100%', maxWidth: 'unset' }}
                      value={scheduleData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="심리상담">심리상담</option>
                      <option value="익명상담">익명상담</option>
                      <option value="위기상담">위기상담</option>
                      <option value="진로상담">진로상담</option>
                      <option value="취업상담">취업상담</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="consultationType">상담 방식</label></td>
                  <td>
                    <select 
                      id="new_consultation_way" 
                      style={{ width: '100%', maxWidth: 'unset' }}
                      value={scheduleData.method}
                      onChange={(e) => handleInputChange('method', e.target.value)}
                    >
                      <option value="대면">대면</option>
                      <option value="비대면">비대면</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td><label htmlFor="consultationType">신청 내용</label></td>
                  <td>
                    <textarea 
                      rows="1" 
                      id="new_apply_content" 
                      value={scheduleData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      required 
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="modal-footer">
            <input 
              type="button" 
              id="save_consultation_schedule" 
              className="btn btn-success" 
              value="상담 일정 저장"
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
      
      {/* Modal backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </div>
  );
};

export default ScheduleModal;