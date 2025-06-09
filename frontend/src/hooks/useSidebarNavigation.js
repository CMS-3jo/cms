// src/hooks/useSidebarNavigation.js
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSidebarNavigation = () => {
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

  useEffect(() => {
    const currentPath = location.pathname;
    const newActiveMenus = new Set();

    // 메뉴 활성화 로직 (board.js의 로직을 React로 변환)
    menuConfig.forEach((menu, menuIndex) => {
      menu.items.forEach(item => {
        const pathSegments = item.path.split('/');
        const pathKey = pathSegments[2]; // '/counseling/applications' -> 'applications'
        
        if (currentPath.includes(pathKey)) {
          newActiveMenus.add(menuIndex);
        }
      });
    });

    // 특별한 경로 매핑 처리 (board.js의 counselorLnb 로직)
    if (currentPath === '/counselor/writeCounselingRecord') {
      newActiveMenus.add(1); // 상담자 리스트 메뉴
    } else if (currentPath === '/counselor/applyContent') {
      newActiveMenus.add(1); // 상담자 리스트 메뉴
    }

    setActiveMenus(newActiveMenus);
  }, [location.pathname]);

  const toggleMenu = (menuIndex) => {
    const newActiveMenus = new Set(activeMenus);
    
    // 다른 메뉴들 닫기 (board.js의 메뉴 토글 로직)
    menuConfig.forEach((_, index) => {
      if (index !== menuIndex) {
        newActiveMenus.delete(index);
      }
    });

    // 현재 메뉴 토글
    if (newActiveMenus.has(menuIndex)) {
      newActiveMenus.delete(menuIndex);
    } else {
      newActiveMenus.add(menuIndex);
    }
    
    setActiveMenus(newActiveMenus);
  };

  const isMenuActive = (menuIndex) => activeMenus.has(menuIndex);
  
  const isItemSelected = (itemPath) => {
    const currentPath = location.pathname;
    return currentPath.includes(itemPath) || 
           (currentPath === '/counselor/writeCounselingRecord' && itemPath.includes('records')) ||
           (currentPath === '/counselor/applyContent' && itemPath.includes('applications'));
  };

  return {
    menuConfig,
    activeMenus,
    toggleMenu,
    isMenuActive,
    isItemSelected
  };
};