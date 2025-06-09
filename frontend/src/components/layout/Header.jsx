// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const mobileMenuItems = [
    { label: '월간', path: '/monthly' },
    { label: '주간', path: '/weekly' },
    { label: '상담 신청 리스트', path: '/counseling/applications' },
    { label: '상담 일지 리스트', path: '/counseling/records' },
    { label: '공지사항', path: '/notices' }
  ];

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a className="nav-link logo">
            <img alt="" src="/images/logo-header.png" />
          </a>
          <ul className="nav nav-underline" id="major_menu"></ul>
        </nav>

        <div className="side_area">
          <p id="login_icon" style={{ display: isLoggedIn ? 'none' : 'block' }}>
            <img alt="로그인" src="/basic-login.svg" />
          </p>
          <p id="logout_icon" style={{ display: isLoggedIn ? 'block' : 'none' }} onClick={logout}>
            <img alt="로그아웃" src="/basic-logout.svg" />
          </p>
          <div className="menu" id="menu_toggle_btn" onClick={toggleMobileMenu}>
            <img alt="메뉴" src="/header-menu.svg" style={{ cursor: 'pointer' }} />
          </div>
          <div 
            className="shownav" 
            id="shownav_menu" 
            style={{ display: showMobileMenu ? 'block' : 'none' }}
          >
            <ul className="nav nav-underline">
              {mobileMenuItems.map((item, index) => (
                <li key={index} className="nav-item">
                  <a className="nav-link" href={item.path}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;