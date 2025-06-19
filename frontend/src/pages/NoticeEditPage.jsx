import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const NoticeEditPage = () => {
  const { id } = useParams();
  const { notices, fetchNotices, getNoticeById, updateNotice } = useNotices();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (notices.length === 0) {
      fetchNotices();
    }
  }, []);

  useEffect(() => {
    const notice = getNoticeById(id);
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
    }
  }, [notices, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateNotice(id, { title, content, files });
    if (result.success) {
      navigate(`/notices/${id}`);
    } else {
      alert('수정 실패');
    }
  };

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>공지사항 수정</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">제목</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">내용</label>
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => setContent(editor.getData())}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">첨부파일</label>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
            </div>
            <button type="submit" className="btn btn-primary">수정</button>
          </form>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NoticeEditPage;