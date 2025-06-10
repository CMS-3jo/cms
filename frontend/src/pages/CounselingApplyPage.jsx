// src/pages/CounselingApplyPage.jsx
import React, { useState } from 'react';
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';

const CounselingApplyPage = () => {
  const [formData, setFormData] = useState({
    applyCategory: '심리상담',
    applyMethod: '대면',
    applyDate: '',
    applyTime: '',
    applyFile: null,
    applyEmail: '',
    applyGender: '',
    applyContent: 'ckeditor사용'
  });

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
                          id="applyCategory" 
                          name="applyCategory"
                          value={formData.applyCategory}
                          onChange={handleInputChange}
                          style={{ maxWidth: 'unset' }}
                        >
                          <option value="심리상담">심리상담</option>
                          <option value="학업상담">학업상담</option>
                          <option value="진로상담">진로상담</option>
                          <option value="기타">기타</option>
                        </select>
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
                      <td><label htmlFor="applyGender">성별</label></td>
                      <td>
                        <label>
                          <input 
                            type="radio" 
                            name="applyGender" 
                            value="male"
                            checked={formData.applyGender === 'male'}
                            onChange={handleInputChange}
                          /> 남성
                        </label>
                        <label>
                          <input 
                            type="radio" 
                            name="applyGender" 
                            value="female"
                            checked={formData.applyGender === 'female'}
                            onChange={handleInputChange}
                          /> 여성
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td><label htmlFor="applyContent">내용</label></td>
                      <td colSpan="3">
                        <textarea 
                          id="applyContent" 
                          name="applyContent" 
                          rows="10" 
                          value={formData.applyContent}
                          onChange={handleInputChange}
                          required
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
      `}</style>
    </div>
  );
};

export default CounselingApplyPage;