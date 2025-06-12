// src/components/common/ChatbotButton.jsx
import React from 'react';

const ChatbotButton = () => {
  const openPopup = async () => {
	  const res = await fetch('http://localhost:8082/api/chat/room', {
	    method: 'POST',
	    headers: { 'Content-Type': 'application/json' },
	    body: JSON.stringify({ customerName: '테스트유저' }),
	  });
	  const data = await res.json();
	  const roomId = data.roomId;

	  // 새 창 열기 (roomId 전달)
	  const width = window.innerWidth;
	  const height = window.innerHeight;
	  const isMobile = width < 769;
	  const popupWidth = isMobile ? width : 400;
	  const popupHeight = isMobile ? height : 800;

	  window.open(
	    `/user/chatbot?roomId=${roomId}`,
	    '',
	    `width=${popupWidth},height=${popupHeight}`
	  );
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