// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content container_layout">
        <div className="footer-left">
          <address>[12345] 서울 마포구 신촌로 176 중앙빌딩</address>
          <br /> 
          Tel: 02-1234-5678 | Fax : 033-1234-5678 | E-mail : abcd@naver.com 
          <br />
          <p>
            <small>COPYRIGHT(C) <span>한국방송통신대학교</span>.All RIGHT RESERVED.</small>
          </p>
        </div>
        <div className="footer-right">
          <img src="/images/logo-header.png" alt="회사 로고" className="footer-logo" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;