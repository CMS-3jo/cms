import React from 'react';

const ChatModal = ({ userId, onSendMessage, onClose }) => {
  return (
    <div className="modal chat chatroom" id="eventModal" tabIndex="1">
      <input type="hidden" name="requesterId" id="requesterId" value={userId} />
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="eventModalLabel">채팅</h5>
          </div>
          <div className="modal-body" id="modal-event-details">
            <div className="chat-content" id="chat-content">
              {/* 채팅 메시지가 여기에 들어감 */}
            </div>
            <div className="chat-text" id="chat-text" style={{ display: 'flex', marginBottom: '20px' }}>
              <input type="text" placeholder="텍스트를 입력해주세요" />
              <input type="button" className="btn btn-success" value="전송" onClick={onSendMessage} />
            </div>
          </div>
          <div className="modal-footer" id="requestContainer" style={{ display: 'none' }}>
            <input type="button" className="btn btn-lg btn-success show" value="수락" />
            <input type="button" className="btn btn-lg btn-secondary" value="거절" />
          </div>
          <div className="modal-footer" id="endContainer">
            <input type="button" className="btn btn-lg btn-secondary close" value="채팅 종료하기" onClick={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;