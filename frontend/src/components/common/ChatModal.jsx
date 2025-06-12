import React, { useState, useCallback } from 'react';
import useChatSocket from '../../hooks/useChatSocket.jsx';


const ChatModal = ({ roomId, onClose }) => {
  const userId = '테스트유저';
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const formatTime = (datetimeStr) => {
    const date = new Date(datetimeStr);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
        roomId, // 반드시 포함
      };
      sendMessage(msg);
      setMessage('');
      // console.log('내 userId:', userId, '| 보낸 메시지:', msg.message);
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
            <div className="chat-content" id="chat-content">
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
			  {!isConnected && (
			    <div className="chat-bubble system error">
			      ⚠️ 연결이 종료되었습니다.
			    </div>
			  )}
            </div>	
            <div className="chat-text" id="chat-text" style={{ display: 'flex', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="텍스트를 입력해주세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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