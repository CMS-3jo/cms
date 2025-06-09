// src/components/counseling/CounselingDetailForm.jsx
import React from 'react';

const CounselingDetailForm = ({ data, onWriteRecord }) => {
  // data가 null이거나 undefined일 때 기본값 처리
  if (!data) {
    return (
      <div className="table_conatiner">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
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
    file = '',
    gender = '남',
    content = ''
  } = data;

  return (
    <div className="table_conatiner">
      <table className="form_write">
        <tbody>
          <tr>
            <td style={{ width: '10%' }}>상담 분류</td>
            <td style={{ width: '40%' }}>
              <input type="text" value={category} readOnly />
            </td>
            <td style={{ width: '10%' }}>학번</td>
            <td>
              <input type="text" value={studentId} readOnly />
            </td>
          </tr>
          <tr>
            <td>상담 방식</td>
            <td>
              <input type="text" value={method} readOnly />
            </td>
            <td>학과</td>
            <td>
              <input type="text" value={department} readOnly />
            </td>
          </tr>
          <tr>
            <td>상담 일시</td>
            <td>
              <input type="text" value={datetime} readOnly />
            </td>
            <td>연락처</td>
            <td>
              <input type="text" value={phone} readOnly />
            </td>
          </tr>
          <tr>
            <td>진행 상태</td>
            <td>
              <input type="text" value={status} readOnly />
            </td>
            <td>이메일</td>
            <td>
              <input type="text" value={email} readOnly />
            </td>
          </tr>
          <tr>
            <td>첨부 파일</td>
            <td>
              <input 
                type="file" 
                name="file" 
                id="file" 
                accept=".jpg, .jpeg, .png, .pdf" 
                readOnly 
              />
            </td>
            <td>성별</td>
            <td>
              <input type="text" value={gender} readOnly />
            </td>
          </tr>
          <tr>
            <td>상담내용</td>
            <td colSpan="4">
              <textarea rows="10" value={content} readOnly />
            </td>
          </tr>
          <tr>
            <td colSpan="4" className="form-buttons">
              <button 
                className="btn btn-success" 
                id="write_record"
                onClick={onWriteRecord}
              >
                상담일지 쓰기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CounselingDetailForm;