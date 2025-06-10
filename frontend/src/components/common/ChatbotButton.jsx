// src/components/common/ChatbotButton.jsx
import React from 'react';

const ChatbotButton = () => {
  const openPopup = () => {
    // 화면 크기를 가져옵니다.
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 모바일 화면 크기 조건
    const isMobile = width < 769;

    // 모바일과 비 모바일에 따른 팝업 크기 설정
    const popupWidth = isMobile ? width : 400;
    const popupHeight = isMobile ? height : 800;

    // 팝업을 엽니다.
    window.open('/user/chatbot', '', `width=${popupWidth},height=${popupHeight}`);
  };

  return (
    <div>
      <a 
        href="#" 
        className="btn floating-btn-chatbot" 
        onClick={(e) => {
          e.preventDefault();
          openPopup();
        }}
      >
        <i className="fas fa-comments"></i>
      </a>
    </div>
  );
};

export default ChatbotButton;