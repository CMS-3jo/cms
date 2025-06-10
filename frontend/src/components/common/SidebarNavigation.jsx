// src/components/common/SidebarNavigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarNavigation = ({ title, menuItems }) => {
  const location = useLocation();

  return (
    <nav className="side_navbar">
      <p className="title">{title}</p>
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className={location.pathname === item.path ? 'selected' : ''}>
            {item.path ? (
              <Link to={item.path}>{item.label}</Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;