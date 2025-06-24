import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useAuth } from '../hooks/useAuth';
const NoticeWritePage = () => {
  const { createNotice } = useNotices();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  const { user } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();

    const noticeData = { title, content, regUserId: user?.userId };

    try {
      if (files.length > 0) {
        const formData = new FormData();
        formData.append(
          'notice',
          new Blob([JSON.stringify(noticeData)], { type: 'application/json' })
        );
        files.forEach((file) => formData.append('files', file));

        const response = await fetch('/api/notices/with-files', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('등록 실패');
        }
      } else {
        const result = await createNotice(noticeData);
        if (!result.success) {
          throw new Error('등록 실패');
        }
      }

      navigate('/notices');
    } catch (err) {
      console.error('공지사항 등록 오류:', err);
      alert('등록 실패');
    }
  };

  return (
    <>
      <Header />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>공지사항 등록</h3>
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
              <label className="form-label">작성자</label>
              <input
                type="text"
                className="form-control"
                value={user?.userId || ''}
                disabled
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
            <button type="submit" className="btn btn-primary">등록</button>
          </form>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NoticeWritePage;