import React, { useState, useCallback, useEffect, useRef } from 'react';
import useChatSocket from '../../hooks/useChatSocket.jsx';

const ChatModal = ({ roomId, onClose }) => {
  const userId = '테스트유저';
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatEndRef = useRef(null);
  const chatContentRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  
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
        sender: userId,
        message,
        roomId,
      };
      sendMessage(msg);
      setMessage('');
      // 메시지 전송 후 맨 아래로 스크롤
      setTimeout(() => scrollToBottom(true), 100);
    }
  };

  return (
    <div className="modal chat chatroom" id="eventModal" tabIndex="1">
      <input type="hidden" name="requesterId" id="requesterId" value="{userId}" />
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="eventModalLabel">채팅</h5>
          </div>
          <div className="modal-body" id="modal-event-details">
            <div 
              className="chat-content" 
              id="chat-content"
              ref={chatContentRef}
            >
              {isConnected && (
                <div className="chat-bubble system success">
                  ✅ 채팅방에 연결되었습니다.
                </div>
              )}

              {chatLog.map((msg, idx) => {
                const isMine = msg.sender === userId;

                const currentTime = formatTime(msg.sentAt);
                const next = chatLog[idx + 1];
                const isLastOfTimeGroup =
                  !next || formatTime(next.sentAt) !== currentTime || next.sender !== msg.sender;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && <div className="sender-name">{msg.sender}</div>}
                      <div className="message-text">{msg.message}</div>
                    </div>

                    {isLastOfTimeGroup && (
                      <div
                        className="timestamp"
                        style={{
                          margin: isMine ? '2px 8px 4px 0' : '2px 0 4px 8px',
                          fontSize: '11px',
                          color: '#999',
                        }}
                      >
                        {currentTime}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={chatEndRef} />
              
              {!isConnected && (
                <div className="chat-bubble system error">
                  ⚠️ 연결이 종료되었습니다.
                </div>
              )}
            </div>

            {/* 맨 아래로 스크롤 버튼 */}
            {showScrollToBottom && (
              <button
                className="scroll-to-bottom-btn"
                onClick={handleScrollToBottomClick}
                title="맨 아래로 이동"
              >
                ↓
              </button>
            )}
            
            <div className="chat-text" id="chat-text" style={{ display: 'flex', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder={isConnected ? '메시지를 입력하세요...' : '연결이 끊어졌습니다.'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={!isConnected}
              />
              <input
                type="button"
                className="btn btn-success"
                value="전송"
                onClick={handleSend}
              />
            </div>
          </div>
          <div className="modal-footer" id="requestContainer" style={{ display: 'none' }}>
            <input type="button" className="btn btn-lg btn-success show" value="수락" />
            <input type="button" className="btn btn-lg btn-secondary" value="거절" />
          </div>
          <div className="modal-footer" id="endContainer">
            <input
              type="button"
              className="btn btn-lg btn-secondary close"
              value="채팅 종료하기"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;