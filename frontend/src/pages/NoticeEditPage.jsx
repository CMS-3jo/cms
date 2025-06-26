import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { useNotices } from '../hooks/useNotices';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useAuth } from '../hooks/useAuth';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import PublicHeader from '../components/layout/PublicHeader';
const NoticeEditPage = () => {
  const { id } = useParams();
  const { notices, fetchNotices, getNoticeById, updateNotice, deleteNotice } = useNotices();
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
        setExistingFiles(data.files || []);
      }
    };

    if (id) {
      loadNotice();
    }
  }, [id, getNoticeById, notices]);
  
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `/api/files/list?refType=NOTICE&refId=${id}&category=ATTACH`
        );
        if (res.ok) {
          const list = await res.json();
          setExistingFiles(list || []);
        }
      } catch (err) {
        console.error('파일 조회 실패:', err);
      }
    };

    if (id) {
      fetchFiles();
    }
  }, [id]);
  const handleFileDelete = async (fileId) => {
    if (!window.confirm('파일을 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/files/${fileId}`, { method: 'DELETE', credentials: 'include' });
      setExistingFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    } catch (err) {
      console.error('파일 삭제 실패:', err);
      alert('파일 삭제 실패');
    }
  };

  const handleDeleteNotice = async () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    const result = await deleteNotice(id);
    if (result.success) {
      navigate('/notices');
    } else {
      alert('삭제 실패');
    }
  };

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
      <PublicHeader />
      <div className="container_layout">
        <Sidebar />
        <main style={{ flex: 1, padding: '20px' }}>
          <h3 style={{paddingTop: '82.8px'  }}>공지사항 수정</h3>
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
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => handleFileDelete(file.fileId)}
                        style={{ marginLeft: '10px' }}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>없음</div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">새 첨부파일</label>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
            </div>
            <div style={{ marginBottom: '10px',position:'absolute',right:'1rem'}}>

            <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
              수정
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteNotice} style={{ marginRight: '10px' }}>
              삭제
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/notices')}>목록</button>
            </div>

          </form>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default NoticeEditPage;