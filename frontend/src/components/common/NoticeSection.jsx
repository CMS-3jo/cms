// src/components/common/NoticeSection.jsx
import React from 'react';

const NoticeSection = () => {
  return (
    <article className="news-item">
      <h2>공지사항</h2>
      <section>
        <table className="table table-striped">
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '70%' }} />
            <col style={{ width: '30%' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'center' }}>번호</th>
              <th scope="col">제목</th>
              <th scope="col">작성일</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td scope="row" style={{ textAlign: 'center' }}></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div>
          <a href="#" className="cta-button">공지사항 더보기</a>
        </div>
      </section>
    </article>
  );
};

export default NoticeSection;