// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'
import { useUserProfile } from '../../hooks/useUserProfile';

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isLoggedIn, logout, loading } = useAuth();
  const profile = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    navigate('/');
  };

   let mobileMenuItems = [
    { label: '월간', path: '/monthly' },
    { label: '주간', path: '/weekly' },
    { label: '상담 신청 리스트', path: '/counseling/applications' },
    { label: '상담 일지 리스트', path: '/counseling/records' },
    { label: '공지사항', path: '/notices' }
  ];

  const isCcaRoute = location.pathname.startsWith('/cca');

  if (isCcaRoute) {
    const deptCd = profile?.deptCode;
    if (deptCd && deptCd.startsWith('S_')) {
      mobileMenuItems = [
        { label: '설문 리스트 보기', path: '/cca/list' },
        { label: '설문 결과 보기', path: '/cca/result' }
      ];
    } else if (deptCd) {
      mobileMenuItems = [
         { label: '설문 리스트 보기', path: '/cca/list' },
        { label: '핵심역량 등록', path: '/cca/register' },
        { label: '핵심역량 분석', path: '/cca/analysis' }
      ];
    }
  }

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
              <span className="material-symbols-outlined header-icons">login</span>
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
              <span className="material-symbols-outlined header-icons" >
                logout
              </span>
            </p>
          )}

          {/* 로딩 중일 때 표시 */}
          {loading && (
            <p style={{ margin: 0, padding: '5px', fontSize: '12px' }}>
              로딩중...
            </p>
          )}

          <div className="menu" id="menu_toggle_btn" onClick={toggleMobileMenu}>
            <span className="material-symbols-outlined header-icons">
              menu
            </span>
          </div>

          <div
            className={`shownav ${showMobileMenu ? 'show' : ''}`}
            id="shownav_menu"
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