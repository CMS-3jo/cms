import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { useUserProfile } from '../hooks/useUserProfile';

const NoticeListPage = () => {
  const { notices, fetchNotices, loading } = useNotices();
  const navigate = useNavigate();
 const profile = useUserProfile();

  const canWrite = profile?.deptCode && !profile.deptCode.startsWith('S_');

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleRowClick = (id) => {
    navigate(`/notices/${id}`);
  };

  const handleCreate = () => {
    navigate('/notices/new');
  };

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>공지사항</h3>
  
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <table className="table">
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
                    <td>{notices.length - index}</td>
                    <td>{notice.title}</td>
                    <td>{notice.regUserId}</td>
                    <td>{notice.viewCnt}</td>
                    <td>{notice.regDt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
               {canWrite && (
            <button
              className="btn btn-primary"
              onClick={handleCreate}
              style={{ marginBottom: '10px' }}
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
