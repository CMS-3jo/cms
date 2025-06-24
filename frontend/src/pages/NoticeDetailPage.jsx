import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { useUserProfile } from '../hooks/useUserProfile';


const NoticeDetailPage = () => {
  const { id } = useParams();
 const { fetchNotices, getNoticeById, notices, loading } = useNotices();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const profile = useUserProfile();
  const canEdit = profile?.deptCode && !profile.deptCode.startsWith('S_');


  useEffect(() => {
    if (notices.length === 0) {
      fetchNotices();
    }
  }, [fetchNotices, notices.length]);
useEffect(() => {
    const loadNotice = async () => {
      const data = await getNoticeById(id);
      setNotice(data || null);
    };

    if (id) {
      loadNotice();
    }
  }, [id, getNoticeById]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.replace('T', ' ').split('.')[0];
  };

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>공지사항 상세</h3>
          {loading || !notice ? (
            <p>로딩 중...</p>
          ) : (
            <>
              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ width: '20%' }}>제목</th>
                    <td>{notice.title}</td>
                  </tr>
                  <tr>
                    <th>작성자</th>
                    <td>{notice.regUserId}</td>
                  </tr>
                  <tr>
                    <th>조회수</th>
                    <td>{notice.viewCnt}</td>
                  </tr>
                  <tr>
                    <th>작성일</th>
                    <td>{formatDate(notice.regDt)}</td>
                    <td>{formatDate(notice.createdDate)}</td>
                  </tr>
                  <tr>
                    <th>첨부파일</th>
                    <td colSpan="2">
                      {notice.files && notice.files.length > 0 ? (
                        <ul>
                          {notice.files.map((file) => (
                            <li key={file.fileId}>
                              <a
                                href={`/api/files/${file.fileId}/download`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.fileNmOrig}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '없음'
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2" dangerouslySetInnerHTML={{ __html: notice.content }} />
                  </tr>
                 
                </tbody>
              </table>
              {canEdit && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/notices/${id}/edit`)}
                  style={{ marginRight: '10px' }}
                >
                  수정
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => navigate('/notices')}>
                목록
              </button>
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NoticeDetailPage;