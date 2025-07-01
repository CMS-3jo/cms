import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { useUserProfile } from '../hooks/useUserProfile';
import PublicHeader from '../components/layout/PublicHeader';

const NoticeListPage = () => {
  const { notices, pagination, fetchNotices, loading } = useNotices();
  const navigate = useNavigate();
  const profile = useUserProfile();

  const canWrite = profile?.deptCode && !profile.deptCode.startsWith('S_');
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    fetchNotices({ page, size });
  }, [page]);

  const handleRowClick = (id) => {
    navigate(`/notices/${id}`);
  };

  const handleCreate = () => {
    navigate('/notices/new');
  };
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPage(newPage);
    }
  };

  // 날짜 포맷 함수
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    // dateTimeStr이 이미 'YYYY-MM-DDTHH:mm:ss' 또는 'YYYY-MM-DD HH:mm:ss' 형식일 수 있음
    // T 또는 공백을 기준으로 분리
    const [date, time] = dateTimeStr.split('T').length === 2
      ? dateTimeStr.split('T')
      : dateTimeStr.split(' ');
    // time에 밀리초가 붙어있을 수 있으니 제거
    const cleanTime = time ? time.split('.')[0] : '';
    return `${date} ${cleanTime}`;
  };

  return (
    <>
      <PublicHeader />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, paddingTop: '82.8px' }}>
          <h3 style={{ marginBottom: '20px' }}>공지사항</h3>

          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <table className="table nl" style={{ backgroundColor: 'white' }}>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>조회수</th>
                  <th>작성일</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice, index) => (
                  <tr key={notice.noticeId} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(notice.noticeId)}>
                         <td>{pagination.totalElements - (page * size + index)}</td>
                    <td>{notice.title}</td>
                    <td>{notice.regUserId}</td>
                    <td>{notice.viewCnt}</td>
                    <td>{formatDateTime(notice.regDt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {pagination.totalPages > 1 && !loading && (
            <div className="mt-3">
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={pagination.isFirst}
                  onClick={() => handlePageChange(page - 1)}
                >이전</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i).map((i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handlePageChange(i)}
                  >{i + 1}</button>
                ))}
                <button
                  className="btn btn-outline-primary btn-sm"
                  disabled={pagination.isLast}
                  onClick={() => handlePageChange(page + 1)}
                >다음</button>
              </div>
            </div>
          )}
        </main>
        {canWrite && (
          <button
            className="btn btn-primary"
            onClick={handleCreate}
            style={{ marginBottom: '10px', position: 'absolute', right: '1rem', bottom: '0' }}
          >
            글쓰기
          </button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default NoticeListPage;