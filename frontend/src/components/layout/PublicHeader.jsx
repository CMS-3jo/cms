// src/components/layout/PublicHeader.jsx
import React, { useState } from 'react';

const PublicHeader = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a className="nav-link logo" href="/">
            <img alt="" src="./images/logo-header.png" />
          </a>
          <ul className="nav nav-underline" id="major_menu">
            <li className="nav-item">
              <a className="nav-link">상담센터 소개</a>
            </li>
            <li className="nav-item">
              <a className="nav-link">심리상담</a>
            </li>
            <li className="nav-item">
              <a className="nav-link">학업상담</a>
            </li>
            <li className="nav-item">
              <a className="nav-link">자가 진단</a>
            </li>
            <li className="nav-item">
              <a className="nav-link">자료실</a>
            </li>
          </ul>
        </nav>

        <div className="side_area">
          <p id="login_icon">
            <a href="">
              <img alt="로그인" src="./images/counselor/basic-login.svg" />
            </a>
          </p>
          <p id="logout_icon" style={{ display: 'none' }}>
            <a href="">
              <img alt="로그아웃" src="./images/counselor/basic-logout.svg" />
            </a>
          </p>
          <div className="menu" onClick={toggleMobileNav}>
            <img alt="" src="./images/counselor/header-menu.svg" />
          </div>
          <div className={`shownav ${showMobileNav ? 'show' : ''}`}>
            <div className="menu" onClick={toggleMobileNav}>
              <img alt="" src="./images/counselor/header-menu.svg" />
            </div>
            <ul className="nav nav-underline" id="navmajor_menu">
              <li className="nav-item">
                <a className="nav-link" href="">상담센터 소개</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">심리상담</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">학업상담</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">자가 진단</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="">자료실</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;