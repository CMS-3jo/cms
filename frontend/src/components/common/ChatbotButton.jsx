// src/components/common/ChatbotButton.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { chatApi } from '../../services/api';

const ChatbotButton = () => {
  const { user } = useAuth();

  const openPopup = async () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 769;
    const popupWidth = isMobile ? width : 400;
    const popupHeight = isMobile ? height : 800;
    // 상담사 → 채팅방 목록 페이지 새 창 열기
    if (user?.role === 'COUNSELOR') {
      window.open(
        '/counselor/chat/list',
        '',
        `width=${popupWidth},height=${popupHeight}`
      );
      return;
    }

    // 학생 → 방 생성 후 채팅방 새 창 열기
    try {
      const res = await chatApi.createRoom({ 
		studentId: user?.userId,
		customerName: user?.name || '이름없음' 
	  });
	  console.log("채팅방 생성 응답:", res); // 추가
      const roomId = res.roomId;

      window.open(
        `/user/chatbot?roomId=${roomId}`,
        '',
        `width=${popupWidth},height=${popupHeight}`
      );
    } catch (err) {
      alert('채팅방 생성 실패!');
      console.error(err);
    }
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
