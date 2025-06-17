// src/components/counseling/CounselingTable.jsx
import React from 'react';

const CounselingTable = ({ data = [], loading = false }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case '상담완료': return 'done';
      case '상담중지': return 'stop';
      case '상담대기': return 'before';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="table_containter">
        <table className="responsive_table">
          <thead>
            <tr>
              <th>현황</th>
              <th>상담자 이름</th>
              <th>학번</th>
              <th>이메일</th>
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'center' }} colSpan="5">로딩 중...</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table_containter">
      <table className="responsive_table">
        <colgroup>
          <col className="col1" style={{ width: '15%' }} />
          <col className="col2" style={{ width: '15%' }} />
          <col className="col1" style={{ width: '17%' }} />
          <col className="col1" style={{ width: '25%' }} />
          <col className="col1" style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>현황</th>
            <th>상담자 이름</th>
            <th>학번</th>
            <th>이메일</th>
            <th>연락처</th>
          </tr>
        </thead>
        <tbody id="counselee_list">
          {data.length === 0 ? (
            <tr>
              <td style={{ textAlign: 'center' }} colSpan="5">신청된 상담이 없습니다.</td>
            </tr>
          ) : (
            data.map((counselee, index) => (
              <tr key={index}>
                <td>
                  <div className={`counselling_status ${getStatusClass(counselee.status)}`}>
                    {counselee.status}
                  </div>
                </td>
                <td>{counselee.name}</td>
                <td>{counselee.studentId}</td>
                <td>{counselee.email}</td>
                <td>{counselee.phone}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CounselingTable;