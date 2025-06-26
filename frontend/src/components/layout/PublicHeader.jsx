// src/components/layout/PublicHeader.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useUserProfile } from "../../hooks/useUserProfile";

const PublicHeader = () => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useUserProfile();
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
 let mobileMenuItems = [
    { label: "상담센터 소개", path: "/center-intro" },
    { label: "심리상담", path: "/cnsl/psychological" },
    { label: "학업상담", path: "/cnsl/academic" },
    { label: "자가 진단", path: "/diagnosis-data" },
    { label: "비교과", path: "/noncur" },
    { label: "핵심역량", path: "/cca/list" },
    { label: "공지사항", path: "/notices" }
  ];

  const isCcaRoute = location.pathname.startsWith("/cca");

  if (isCcaRoute) {
    const deptCd = profile?.deptCode;

    if (deptCd && deptCd.startsWith("S_")) {
      // 학생용 메뉴
      mobileMenuItems = [
        { label: "핵심역량 리스트", path: "/cca/list" },
        { label: "핵심역량 결과보기", path: "/cca/result" }
      ];
    } else if (deptCd) {
      // 교수/상담사용 메뉴
      mobileMenuItems = [
        { label: "핵심역량 등록", path: "/cca/register" },
        { label: "핵심역량 분석", path: "/cca/analysis" }
      ];
    }
  }

  return (
    <header>
      <div className="container_layout">
        <nav className="nav">
          <a
            className="nav-link logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img alt="" src="/images/logo-header.png" />
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
              <a className="nav-link" href="/noncur">
                비교과
              </a>
            </li>
  
            <li className="nav-item">
              <a className="nav-link" href="/cca/list">
                핵심역량
              </a>
            </li>

                      <li className="nav-item">
              <a className="nav-link" href="/notices">
                공지사항
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
              <span className="material-symbols-outlined header-icons close">
                close
              </span>
            </div>
            <ul className="nav nav-underline" id="navmajor_menu">
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

export default PublicHeader;
