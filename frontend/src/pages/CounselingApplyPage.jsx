// src/pages/CounselingApplyPage.jsx
import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import { useParams } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { counselingApi } from '../services/api';

const CounselingApplyPage = () => {
  const { parentCd } = useParams();
  const [subTypes, setSubTypes] = useState([]);
  const [formData, setFormData] = useState({
    parentCategory: parentCd,  // 대분류 (URL에서 받아옴, hidden 처리)
    typeCd: '',                // 소분류 CD (ex: 'EMPLOY')
    statCd: 'REQUESTED',       // 상태코드 기본값
    applyMethod: '대면',       // 상담 방식
    applyDate: '',             // 희망 일자
    applyTime: '',             // 희망 시간
    applyFile: null,           // 파일 (FormData로 전송)
    applyEmail: '',            // 이메일
    applyContent: ''           // 내용
  });
  
  useEffect(() => {
    counselingApi.getCodes('CNSL_TYPE_CD')
      .then((data) => {
		console.log("parentCd 원형:", parentCd, typeof parentCd);
        console.log("API 응답:", data);
        const filtered = data.filter((c) => c.desc === parentCd);
        console.log("필터링 결과:", filtered);
        setSubTypes(filtered);
      })
      .catch((err) => {
        console.error('코드 목록 가져오기 실패', err);
      });
  }, [parentCd]);
  
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('상담 신청 데이터:', formData);
    // 여기에 실제 제출 로직 구현
  };

  return (
    <div>
      <PublicHeader />
      
      <main>
        <header className="hero-section">
          <div className="hero-content">
            <h1>상담 신청</h1>
          </div>
        </header>

        <article className="container_layout">
          <nav className="side_navbar">
            <p className="title">상담 신청하기</p>
            <ul>
              <li className="selected">
                <a href="">신청서 작성하기</a>
              </li>
            </ul>
          </nav>

          <section className="contents">
            <h4 className="board_title">상담 신청서 작성</h4>
            <div className="table_container">
              <form id="frmApply" onSubmit={handleSubmit}>
                <table className="form_write input_box">
                  <colgroup>
                    <col className="col-apply-category" />
                    <col className="col-apply-method" />
                    <col className="col-apply-department" />
                    <col className="col-apply-contact" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <td><label htmlFor="applyCategory">상담 분류</label></td>
                      <td>
					  <select 
					    id="typeCd" 
					    name="typeCd"
					    value={formData.typeCd}
					    onChange={handleInputChange}
					    required
					  >
					    <option value="">상담 유형 선택</option>
					    {subTypes.map((s) => (
					      <option key={s.code} value={s.code}>
					        {s.name}
					      </option>
					    ))}
					  </select>
					  <input type="hidden" name="parentCategory" value={formData.parentCategory} />
                      </td>
                      <td><label htmlFor="applyMethod">상담 방식</label></td>
                      <td>
                        <select 
                          id="applyMethod"
                          name="applyMethod"
                          value={formData.applyMethod}
                          onChange={handleInputChange}
                          style={{ maxWidth: 'unset' }}
                        >
                          <option value="대면">대면</option>
                          <option value="비대면">비대면</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td><label htmlFor="applyDepartment">학과</label></td>
                      <td>
                        <input type="text" readOnly />
                      </td>
                      <td><label htmlFor="applyContact">연락처</label></td>
                      <td>
                        <input type="text" readOnly />
                      </td>
                    </tr>
                    <tr>
                      <td><label htmlFor="applyDate">희망 일자</label></td>
                      <td>
                        <input 
                          type="date" 
                          id="applyDate" 
                          name="applyDate" 
                          value={formData.applyDate}
                          onChange={handleInputChange}
                          style={{ width: '100%' }} 
                          required 
                        />
                      </td>
                      <td><label htmlFor="applyTime">희망 시간</label></td>
                      <td>
                        <select 
                          id="applyTime" 
                          name="applyTime" 
                          value={formData.applyTime}
                          onChange={handleInputChange}
                          style={{ maxWidth: 'unset' }}
                        >
                          <option value="">시간을 선택해주세요</option>
                          <option value="09:00:00">09:00</option>
                          <option value="10:00:00">10:00</option>
                          <option value="11:00:00">11:00</option>
                          <option value="12:00:00">12:00</option>
                          <option disabled>== 점심시간 ==</option>
                          <option value="14:00:00">14:00</option>
                          <option value="15:00:00">15:00</option>
                          <option value="16:00:00">16:00</option>
                          <option value="17:00:00">17:00</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td><label htmlFor="applyFile">첨부 파일</label></td>
                      <td>
                        <input 
                          type="file" 
                          id="applyFile" 
                          name="applyFile" 
                          onChange={handleInputChange}
                          style={{ width: '100%' }} 
                          required 
                          multiple 
                        />
                      </td>
                      <td><label htmlFor="applyEmail">이메일</label></td>
                      <td>
                        <input 
                          type="email" 
                          id="applyEmail"
                          name="applyEmail"
                          value={formData.applyEmail}
                          onChange={handleInputChange}
                        />
                      </td>
                    </tr>					
					<tr>
					  <td><label htmlFor="applyContent">내용</label></td>
					  <td colSpan="3">
					    <CKEditor
					      editor={ClassicEditor}
					      data={formData.applyContent}
					      onChange={(event, editor) => {
					        const data = editor.getData();
					        setFormData(prev => ({ ...prev, applyContent: data }));
					      }}
					    />
					  </td>
					</tr>
                    <tr>
                      <td colSpan="4" className="form-buttons">
                        <button type="submit" id="btnApply" className="btn btn-success">
                          상담 신청
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          </section>
        </article>
      </main>
      
      <Footer />

      <style jsx>{`
		
        /* 전체 페이지 스타일 */
        body {
          margin: 0;
          font-family: Arial, sans-serif;
        }
        
        .form_write {
          width: 100%;
          border-collapse: collapse;
        }
        
        .form_write td {
          padding: 10px;
        }
        
        .form_write input[type="text"],
        .form_write input[type="email"],
        .form_write input[type="date"],
        .form_write input[type="file"],
        .form_write select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        
        .form_write input[type="date"],
        .form_write input[type="file"] {
          width: 300px;
        }
        
        .form_write textarea {
          width: 100%;
          resize: vertical;
        }
        
        .form-buttons {
          text-align: center;
          padding: 20px 0;
        }
        
        .form-buttons .btn {
          padding: 10px 20px;
          font-size: 16px;
        }
        
        .form_write .row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .form_write .col {
          flex: 1;
        }
        
        .form_write .col-half {
          flex: 0 0 50%;
        }
		
		.ck-editor__editable_inline {
		      min-height: 400px;
		    }
      `}</style>
    </div>
  );
};

export default CounselingApplyPage;