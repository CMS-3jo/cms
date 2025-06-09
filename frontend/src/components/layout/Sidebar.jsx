// src/components/layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [activeMenus, setActiveMenus] = useState(new Set());
  const location = useLocation();

  const menuConfig = [
    {
      title: '상담일정 관리',
      items: [
        { label: '월간', path: '/counseling/monthly' },
        { label: '주간', path: '/counseling/weekly' }
      ]
    },
    {
      title: '상담자 리스트',
      items: [
        { label: '상담 신청 리스트', path: '/counseling/applications' },
        { label: '상담 일지 리스트', path: '/counseling/records' }
      ]
    },
    {
      title: '게시판',
      items: [
        { label: '공지사항', path: '/notices' }
      ]
    }
  ];

  // 현재 경로에 따른 활성 메뉴 설정
  useEffect(() => {
    const currentPath = location.pathname;
    const newActiveMenus = new Set();

    menuConfig.forEach((menu, menuIndex) => {
      menu.items.forEach(item => {
        if (currentPath.includes(item.path)) {
          newActiveMenus.add(menuIndex);
        }
      });
    });

    // 특별한 경로 매핑 처리
    if (currentPath === '/counselor/writeCounselingRecord') {
      newActiveMenus.add(1); // 상담자 리스트 메뉴
    } else if (currentPath === '/counselor/applyContent') {
      newActiveMenus.add(1); // 상담자 리스트 메뉴
    }

    setActiveMenus(newActiveMenus);
  }, [location.pathname]);

  const toggleMenu = (menuIndex) => {
    const newActiveMenus = new Set(activeMenus);
    if (newActiveMenus.has(menuIndex)) {
      newActiveMenus.delete(menuIndex);
    } else {
      newActiveMenus.add(menuIndex);
    }
    setActiveMenus(newActiveMenus);
  };

  return (
    <nav className="side_navbar">
      <p className="title">상담 일정관리</p>
      <ul>
        {menuConfig.map((menu, menuIndex) => (
          <li key={menuIndex}>
            <a 
              href="#" 
              className="menu-toggle"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu(menuIndex);
              }}
            >
              {menu.title}
            </a>
            <div className={`menu-container ${activeMenus.has(menuIndex) ? 'active' : ''}`}>
              <ul className="submenu">
                {menu.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex}
                    className={location.pathname.includes(item.path) ? 'selected' : ''}
                  >
                    <a href={item.path}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;