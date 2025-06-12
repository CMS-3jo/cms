// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isLoggedIn, logout, loading } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLoginClick = () => {
    console.log('🔴 로그인 버튼 클릭됨!');
    console.log('현재 isLoggedIn:', isLoggedIn);
    navigate('/login');
  };

  const handleLogout = () => {
    console.log('🔴 로그아웃 버튼 클릭됨!');
    logout();
    navigate('/');
  };

  const mobileMenuItems = [
    { label: '월간', path: '/monthly' },
    { label: '주간', path: '/weekly' },
    { label: '상담 신청 리스트', path: '/counseling/applications' },
    { label: '상담 일지 리스트', path: '/counseling/records' },
    { label: '공지사항', path: '/notices' }
  ];

  // 디버깅을 위한 로그
  console.log('🔵 Header 렌더링 - isLoggedIn:', isLoggedIn, 'loading:', loading);

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a 
            className="nav-link logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <img alt="" src="/images/logo-header.png" />
          </a>
          <ul className="nav nav-underline" id="major_menu"></ul>
        </nav>

        <div className="side_area">
          {/* 로그인 아이콘 - 로그아웃 상태일 때만 표시 */}
          {!loading && !isLoggedIn && (
            <p 
              id="login_icon" 
              onClick={handleLoginClick}
              style={{ 
                cursor: 'pointer',
                display: 'block',
                margin: 0,
                padding: '5px'
              }}
            >
              <img alt="로그인" src="/basic-login.svg" />
            </p>
          )}
          
          {/* 로그아웃 아이콘 - 로그인 상태일 때만 표시 */}
          {!loading && isLoggedIn && (
            <p 
              id="logout_icon" 
              onClick={handleLogout}
              style={{ 
                cursor: 'pointer',
                display: 'block',
                margin: 0,
                padding: '5px'
              }}
            >
              <img alt="로그아웃" src="/basic-logout.svg" />
            </p>
          )}

          {/* 로딩 중일 때 표시 */}
          {loading && (
            <p style={{ margin: 0, padding: '5px', fontSize: '12px' }}>
              로딩중...
            </p>
          )}

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