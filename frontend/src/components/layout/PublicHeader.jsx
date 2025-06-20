// src/components/layout/PublicHeader.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";

const PublicHeader = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate("/login");
  };

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a
            className="nav-link logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img alt="" src="./images/logo-header.png" />
          </a>
          <ul className="nav nav-underline" id="major_menu">
            <li className="nav-item">
              <a className="nav-link" href="/center-intro">
                상담센터 소개
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/cnsl/psychological">
                심리상담
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/cnsl/academic">
                학업상담
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/self-diagnosis">
                자가 진단
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/resources">
                자료실
              </a>
            </li>
                        <li className="nav-item">
              <a className="nav-link" href="/notices">
                공지사항
              </a>
            </li>
                        <li className="nav-item">
              <a className="nav-link" href="/cca/list">
                핵심역량
              </a>
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
                style={{ cursor: "pointer" }}
              >
                <span className="material-symbols-outlined header-icons">
                  login
                </span>

              </a>
            </p>
          )}

          {/* 마이페이지 아이콘 - 로그인 상태일 때 */}
          {isLoggedIn && (
            <a href="/mypage" style={{ cursor: "pointer" }}>
              <span className="material-symbols-outlined header-icons">
                account_circle
              </span>
            </a>
          )}

          {/* 로그아웃 아이콘 - 로그인 상태일 때 */}
          {isLoggedIn && (
            <p id="logout_icon">
              <a href="#" onClick={handleLogout} style={{ cursor: "pointer" }}>
                <span className="material-symbols-outlined header-icons">
                  logout
                </span>
              </a>
            </p>
          )}

          <div className="menu" onClick={toggleMobileNav}>
            <span className="material-symbols-outlined header-icons">
              dehaze
            </span>
          </div>
          <div className={`shownav ${showMobileNav ? "show" : ""}`}>
            <div className="menu" onClick={toggleMobileNav}>
              <img alt="" src="./images/counselor/header-menu.svg" />
            </div>
            <ul className="nav nav-underline" id="navmajor_menu">
              <li className="nav-item">
                <a className="nav-link" href="/center-intro">
                  상담센터 소개
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cnsl/psychological">
                  심리상담
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/cnsl/academic">
                  학업상담
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/diagnosis-data">
                  자가 진단
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/resources">
                  자료실
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
