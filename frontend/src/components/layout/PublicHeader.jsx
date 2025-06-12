// src/components/layout/PublicHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

const PublicHeader = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log('🚨 PublicHeader 로그인 클릭!');
    navigate('/login');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    console.log('🚨 PublicHeader 로그아웃 클릭!');
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a 
            className="nav-link logo" 
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
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
          {/* 로그인 아이콘 - 로그아웃 상태일 때 */}
          {!isLoggedIn && (
            <p id="login_icon">
              <a 
                href="#" 
                onClick={handleLoginClick}
                style={{ cursor: 'pointer' }}
              >
                <img alt="로그인" src="./images/counselor/basic-login.svg" />
              </a>
            </p>
          )}
          
          {/* 로그아웃 아이콘 - 로그인 상태일 때 */}
          {isLoggedIn && (
            <p id="logout_icon">
              <a 
                href="#" 
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <img alt="로그아웃" src="./images/counselor/basic-logout.svg" />
              </a>
            </p>
          )}
          
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