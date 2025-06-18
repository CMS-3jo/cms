// src/components/counseling/CounselingTable.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../services/api';
import { counselingApi } from '../../services/api';

const CounselingTable = ({ data = [], loading = false, onAssigned }) => {
  const navigate = useNavigate();
  const getStatusClass = (status) => {
    switch (status) {
      case '상담완료': return 'done';
      case '상담중지': return 'stop';
      case '상담대기': return 'before';
      case '상담중': return 'ing';
      default: return '';
    }
  };
  
  const handleAssign = async (cnslAplyId) => {
    try {
      // 현재 로그인된 사용자 정보 요청
      const counselor = await userApi.getSummary();

      const empNo = counselor.data.identifierNo;

      // 상담 배정 요청
      const response = await counselingApi.assignCounselor(cnslAplyId, { empNo: empNo });
	  
      if (response.success) {
        alert('상담사 배정 완료!');
		onAssigned?.();
      } else {
        alert('배정 실패: ' + (response.message || '오류 발생'));
      }
    } catch (error) {
      console.error('배정 오류:', error);
      alert('상담사 배정 중 오류가 발생했습니다.');
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
              <td style={{ textAlign: 'center' }} colSpan="6">로딩 중...</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  
  const handleRowClick = (id) => {
    navigate(`/admin/counseling/${id}`);
  };
  
  return (
    <div className="table_containter">
      <table className="responsive_table">
        <colgroup>
          <col className="col1" style={{ width: '15%' }} />
          <col className="col2" style={{ width: '15%' }} />
          <col className="col1" style={{ width: '17%' }} />
          <col className="col1" style={{ width: '25%' }} />
          <col className="col1" style={{ width: '18%' }} />
          <col className="col1" style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>현황</th>
            <th>상담자 이름</th>
            <th>학번</th>
            <th>이메일</th>
            <th>연락처</th>
			<th>배정</th>
          </tr>
        </thead>
        <tbody id="counselee_list">
          {data.length === 0 ? (
            <tr>
              <td style={{ textAlign: 'center' }} colSpan="6">신청된 상담이 없습니다.</td>
            </tr>
          ) : (
            data.map((counselee) => (
              <tr key={counselee.cnslAplyId} onClick={() => handleRowClick(counselee.cnslAplyId)}>
                <td>
                  <div className={`counselling_status ${getStatusClass(counselee.status)}`}>
                    {counselee.status}
                  </div>
                </td>
                <td>{counselee.name}</td>
                <td>{counselee.studentId}</td>
                <td>{counselee.email}</td>
                <td>{counselee.phone}</td>
				<td>
				  {counselee.emplNo ? (
				    <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
				      배정완료
				    </button>
				  ) : (
				    <button onClick={() => handleAssign(counselee.cnslAplyId)}>
				      배정
				    </button>
				  )}
		        </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CounselingTable;