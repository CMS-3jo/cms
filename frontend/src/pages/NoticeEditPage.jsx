import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useAuth } from '../hooks/useAuth';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const NoticeEditPage = () => {
  const { id } = useParams();
  const { notices, fetchNotices, getNoticeById, updateNotice } = useNotices();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const { user } = useAuth();

 const [existingFiles, setExistingFiles] = useState([]);
  useEffect(() => {
    if (notices.length === 0) {
      fetchNotices();
    }
 }, [fetchNotices, notices.length]);

 useEffect(() => {
    const loadNotice = async () => {
      const data = await getNoticeById(id);
      if (data) {
        setTitle(data.title);
        setContent(data.content);
          setExistingFiles(Array.isArray(data.files) ? data.files : []);
      }
    };

    if (id) {
      loadNotice();
    }
  }, [id, getNoticeById, notices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
      const result = await updateNotice(id, {
      title,
      content,
      files,
      regUserId: user?.userId,
    });
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
             <label className="form-label">기존 첨부파일</label>
              {existingFiles.length > 0 ? (
                <ul>
                  {existingFiles.map((file) => (
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
            </div>
            <div className="mb-3">
              <label className="form-label">새 첨부파일</label>
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