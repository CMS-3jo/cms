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
   const result = await createNotice({ title, content, regUserId: user?.userId });
    if (result.success) {
      navigate('/notices');
    } else {
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