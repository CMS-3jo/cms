// src/components/counseling/CounselingRecordForm.jsx
import React, { useState } from 'react';

const CounselingRecordForm = ({ 
  counselingDetail, 
  recordData, 
  onSaveRecord, 
  onOpenScheduleModal, 
  loading 
}) => {
  const [recordTitle, setRecordTitle] = useState('');
  const [recordContent, setRecordContent] = useState('');
  const [counselingCategory, setCounselingCategory] = useState('심리상담');

  const handleSaveRecord = () => {
    if (!recordTitle.trim() || !recordContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    onSaveRecord({
      title: recordTitle,
      content: recordContent,
      category: counselingCategory,
      writeTime: new Date().toLocaleString()
    });
  };

  if (!counselingDetail) {
    return <div>데이터를 불러오는 중...</div>;
  }

  const {
    category = '',
    studentId = '',
    method = '',
    department = '',
    datetime = '',
    phone = '',
    status = '상담완료',
    email = '',
    gender = '',
    content = ''
  } = counselingDetail;

  return (
    <>
      {/* 상담 신청 내역 */}
      <table className="form_write">
        <tbody>
          <tr>
            <td><label>상담 분류</label></td>
            <td>
              <input type="text" value={category} readOnly />
            </td>
            <td><label htmlFor="student_number" style={{ padding: '0px 5px' }}>학번</label></td>
            <td>
              <input type="text" value={studentId} readOnly />
            </td>
          </tr>
          <tr>
            <td><label>상담 방식</label></td>
            <td>
              <input type="text" value={method} readOnly />
            </td>
            <td><label htmlFor="major" style={{ padding: '0px 5px' }}>학과</label></td>
            <td>
              <input type="text" value={department} readOnly />
            </td>
          </tr>
          <tr>
            <td><label>상담 일시</label></td>
            <td>
              <input type="hidden" />
              <input type="text" value={datetime} readOnly />
            </td>
            <td><label style={{ padding: '0px 5px' }}>연락처</label></td>
            <td>
              <input type="text" value={phone} readOnly />
            </td>
          </tr>
          <tr>
            <td><label htmlFor="progress">진행 상태</label></td>
            <td>
              <input type="text" value={status} readOnly />
            </td>
            <td><label htmlFor="email" style={{ padding: '0px 5px' }}>이메일</label></td>
            <td>
              <input type="text" value={email} readOnly />
            </td>
          </tr>
          <tr>
            <td><label htmlFor="file">첨부 파일</label></td>
            <td>
              <input 
                type="file" 
                name="file" 
                id="file" 
                accept=".jpg, .jpeg, .png, .pdf" 
                readOnly 
              />
            </td>
            <td><label style={{ padding: '0px 5px' }}>성별</label></td>
            <td>
              <input type="text" value={gender} readOnly />
            </td>
          </tr>
          <tr>
            <td><label htmlFor="content">상담내용</label></td>
            <td colSpan="4">
              <div className="input-group mb-3">
                <select 
                  className="form-select" 
                  id="counseling_category" 
                  style={{ width: '100%', maxWidth: 'unset' }}
                  value={counselingCategory}
                  onChange={(e) => setCounselingCategory(e.target.value)}
                >
                  <option value="심리상담">심리상담</option>
                  <option value="익명상담">익명상담</option>
                  <option value="위기상담">위기상담</option>
                  <option value="진로상담">진로상담</option>
                  <option value="취업상담">취업상담</option>
                </select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      
      {/* 상담 일지 */}
      <h4 className="board_title">
        <b>{counselingDetail.name || '홍길동'}</b> 학생의 상담 일지
      </h4>
      
      <div className="table_conatiner">
        <table className="form_write">
          <tbody>
            <tr>
              <td><label>일지 제목</label></td>
              <td colSpan="4">
                {recordData?.savedTitle && (
                  <input type="text" id="save_title" value={recordData.savedTitle} readOnly />
                )}
                <input 
                  type="text" 
                  id="record_title" 
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="일지 제목을 입력하세요"
                />
              </td>
            </tr>
            <tr>
              <td><label htmlFor="write_time">작성 일시</label></td>
              <td>
                {recordData?.savedTime && (
                  <input type="text" value={recordData.savedTime} readOnly />
                )}
                <input type="text" placeholder="저장시 자동으로 등록됩니다." readOnly />
              </td>
              <td><label style={{ padding: '0px 5px' }}>작성자</label></td>
              <td>
                <input type="text" value="관리자" readOnly />
              </td>
            </tr>
            <tr>
              <td><label>상담 내용</label></td>
              <td colSpan="4">
                {recordData?.savedContent && (
                  <textarea 
                    id="save_content" 
                    rows="10" 
                    value={recordData.savedContent} 
                    readOnly
                  />
                )}
                <textarea 
                  id="record_content" 
                  rows="10" 
                  value={recordContent}
                  onChange={(e) => setRecordContent(e.target.value)}
                  placeholder="상담 후 사항을 입력하세요"
                  required
                />
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="form-buttons">
                <button 
                  className="btn btn-success" 
                  onClick={onOpenScheduleModal}
                  disabled={loading}
                >
                  상담 일정 등록
                </button>
                <button 
                  className="btn btn-success" 
                  id="save_record"
                  onClick={handleSaveRecord}
                  disabled={loading}
                >
                  {loading ? '저장 중...' : '상담 일지 저장'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CounselingRecordForm;