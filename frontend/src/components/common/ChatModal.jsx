import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import  useChatSocket  from '../../hooks/useChatSocket.jsx'; // 기존 웹소켓 훅 사용

const ChatModal = ({ roomId, onClose }) => {
  const { user } = useAuth();
  const userId = user?.userId;
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const chatEndRef = useRef(null);
  const chatContentRef = useRef(null);
  const isUserScrollingRef = useRef(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  const formatTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scrollToBottom = (force = false) => {
    if (chatEndRef.current && (force || !isUserScrollingRef.current)) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setShowScrollToBottom(false);
    }
  };

  // 스크롤 위치 감지
  const handleScroll = useCallback(() => {
    if (!chatContentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContentRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10; // 10px 여유

    if (isAtBottom) {
      isUserScrollingRef.current = false;
      setShowScrollToBottom(false);
    } else {
      isUserScrollingRef.current = true;
      setShowScrollToBottom(true);
    }
  }, []);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const chatContent = chatContentRef.current;
    if (chatContent) {
      chatContent.addEventListener('scroll', handleScroll);
      return () => chatContent.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 새 메시지가 추가될 때 스크롤 처리
  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  // 맨 아래로 스크롤 버튼 클릭 핸들러
  const handleScrollToBottomClick = () => {
    scrollToBottom(true);
  };

  const handleReceive = useCallback((incomingMsg) => {
    setChatLog((prev) => [...prev, incomingMsg]);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
  }, []);

  const { sendMessage } = useChatSocket(
    roomId,
    handleReceive,
    handleDisconnect,
    handleConnect
  );

  const handleSend = () => {
    if (message.trim()) {
      const msg = {
        roomId,
        senderId: user.userId, // 로그인된 사용자 ID
        senderName: user.name, // 사용자 이름
        senderRole: user.role, // ROLE_STUDENT or ROLE_COUNSELOR
        content: message // 메시지 내용
      };

      sendMessage(msg);
      setMessage('');
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  // 내 메시지인지 확인하는 함수
  const isMyMessage = (msg) => {
    return msg.senderId === user?.userId;
  };

  // 채팅방 정보 조회
  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const roomData = await response.json();
        setRoomInfo(roomData);
      }
    } catch (error) {
      console.error('채팅방 정보 로딩 실패:', error);
    }
  };

  // 채팅방 나가기 (학생만)
  const handleLeaveRoom = async () => {
    if (user?.role !== 'ROLE_STUDENT') {
      return; // 학생이 아니면 나가기 불가
    }

    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('채팅방을 나갔습니다.');
        onClose(); // 모달 닫기
      } else {
        console.error('채팅방 나가기 실패');
      }
    } catch (error) {
      console.error('채팅방 나가기 중 오류:', error);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId]);

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="modal show d-block" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        onClick={handleBackdropClick}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '90vw', height: '90vh' }}>
          <div className="modal-content h-100 d-flex flex-column">
            {/* 모달 헤더 */}
            <div className="modal-header bg-primary text-white flex-shrink-0">
              <div className="d-flex align-items-center">
                <div className="avatar-circle me-3">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div>
                  <h5 className="modal-title mb-0">
                    {roomInfo?.studentName || '상담 채팅'}
                  </h5>
                  {roomInfo && (
                    <small className="opacity-75">
                      ID: {roomInfo.studentId} | 상태: {
                        roomInfo.status === 'ACTIVE' ? '진행중' : 
                        roomInfo.status === 'WAITING' ? '대기중' : '완료'
                      }
                    </small>
                  )}
                </div>
              </div>
              <div className="d-flex">
                {user?.role === 'ROLE_STUDENT' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={handleLeaveRoom}
                    title="상담 나가기"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light me-2"
                  onClick={onClose}
                  title="최소화"
                >
                  <i className="bi bi-dash-lg"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={onClose}
                  title="닫기 (ESC)"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            {/* 메시지 영역 */}
            <div className="modal-body flex-grow-1 d-flex flex-column p-0" style={{ minHeight: 0 }}>
              <div className="chat-messages flex-grow-1 overflow-auto p-3 d-flex flex-column" ref={chatContentRef}>
                {chatLog.length === 0 ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center text-muted">
                      <i className="bi bi-chat-dots fs-1 mb-3 d-block"></i>
                      <div className="d-flex align-items-center">
                        <div className={`connection-indicator me-2 ${isConnected ? 'connected' : 'disconnected'}`}></div>
                        <p className="mb-0">
                          {isConnected ? '첫 메시지를 보내보세요!' : '연결 중...'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="messages-container">
                    {chatLog.map((msg, index) => {
                      const isMine = isMyMessage(msg);
                      return (
                        <div
                          key={index}
                          className={`d-flex mb-3 ${
                            isMine ? 'justify-content-end' : 'justify-content-start'
                          }`}
                        >
                          {!isMine && (
                            <div className={`avatar me-2 ${
                              msg.senderRole === 'ROLE_COUNSELOR' ? 'counselor-avatar' : 'student-avatar'
                            }`}>
                              <i className={`bi ${
                                msg.senderRole === 'ROLE_COUNSELOR' ? 'bi-headset' : 'bi-person-fill'
                              }`}></i>
                            </div>
                          )}
                          <div
                            className={`message-bubble px-3 py-2 shadow-sm ${
                              isMine
                                ? 'bg-primary text-white'
                                : 'bg-white border'
                            }`}
                            style={{ 
                              maxWidth: '70%', 
                              wordBreak: 'break-word',
                              borderRadius: '12px'
                            }}
                          >
                            {!isMine && (
                              <div className="sender-name mb-1" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#6c757d' }}>
                                {msg.senderName}
                              </div>
                            )}
                            <div className="message-content mb-1">
                              {msg.content}
                            </div>
                            <div className={`message-time text-end ${
                              isMine ? 'text-white-50' : 'text-muted'
                            }`} style={{ fontSize: '0.75rem' }}>
                              {msg.timestamp ? formatTime(msg.timestamp) : formatTime(new Date())}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                )}
                
                {/* 맨 아래로 스크롤 버튼 */}
                {showScrollToBottom && (
                  <button
                    className="scroll-to-bottom-btn btn btn-primary rounded-circle shadow"
                    onClick={handleScrollToBottomClick}
                    title="맨 아래로"
                  >
                    <i className="bi bi-chevron-down"></i>
                  </button>
                )}
              </div>
            </div>

            {/* 메시지 입력 영역 */}
            <div className="modal-footer flex-shrink-0 border-top">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="w-100">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!isConnected || roomInfo?.status === 'COMPLETED'}
                    style={{ borderRadius: '25px 0 0 25px' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={!message.trim() || !isConnected || roomInfo?.status === 'COMPLETED'}
                    style={{ borderRadius: '0 25px 25px 0' }}
                  >
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div className="d-flex align-items-center">
                    <div className={`connection-indicator me-2 ${isConnected ? 'connected' : 'disconnected'}`}></div>
                    <small className="text-muted">
                      {isConnected ? '연결됨' : '연결 중...'}
                    </small>
                  </div>
                  {roomInfo?.status === 'COMPLETED' && (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      이 상담은 완료되었습니다.
                    </small>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .avatar {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          font-size: 0.9rem;
        }
        
        .student-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .counselor-avatar {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        .chat-messages {
          background: #f8f9fa;
          background-image: 
            radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2px, transparent 0);
          background-size: 100px 100px;
        }
        
        .message-bubble {
          position: relative;
          animation: fadeInUp 0.3s ease;
        }
        
        .message-content {
          line-height: 1.4;
        }
        
        .message-time {
          line-height: 1;
        }
        
        .modal-content {
          border: none;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          border-radius: 15px;
          overflow: hidden;
        }
        
        .modal-header {
          border-bottom: none;
          padding: 1rem 1.5rem;
        }
        
        .modal-footer {
          border-top: 1px solid #dee2e6;
          padding: 1rem 1.5rem;
          background: white;
        }
        
        .btn:focus {
          box-shadow: none;
        }
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13,110,253,.15);
        }
        
        .messages-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* 스크롤바 스타일링 */
        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }
        
        .chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
    </>
  );
};

export default ChatModal;