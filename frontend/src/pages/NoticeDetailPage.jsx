import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';

const NoticeDetailPage = () => {
  const { id } = useParams();
  const { fetchNotices, getNoticeById, notices } = useNotices();
  const navigate = useNavigate();

  useEffect(() => {
    if (notices.length === 0) {
      fetchNotices();
    }
  }, []);

  const notice = getNoticeById(id) || {};

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>공지사항 상세</h3>
          <table className="table">
            <tbody>
              <tr>
                <th style={{ width: '20%' }}>제목</th>
                <td>{notice.title}</td>
              </tr>
              <tr>
                <th>작성일</th>
                <td>{notice.createdDate}</td>
              </tr>
              <tr>
                <td colSpan="2" dangerouslySetInnerHTML={{ __html: notice.content }} />
              </tr>
            </tbody>
          </table>
          <button className="btn btn-primary" onClick={() => navigate(`/notices/${id}/edit`)} style={{ marginRight: '10px' }}>수정</button>
          <button className="btn btn-secondary" onClick={() => navigate('/notices')}>목록</button>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NoticeDetailPage;