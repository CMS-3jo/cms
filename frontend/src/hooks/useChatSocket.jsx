import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useRef } from 'react';

export default function useChatSocket(roomId, onMessageReceived, onDisconnect, onConnect) {
  const clientRef = useRef(null);

  useEffect(() => {
	if (!roomId || clientRef.current) {
	    console.warn('🟡 이미 연결 중이거나 roomId 없음');
	    return;
	  }
    const socket = new SockJS('http://localhost:8082/gs-websocket');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('🔌 WebSocket connected to room:', roomId);

        if (onConnect) onConnect(); // ✅ 여기에 호출 추가

        client.subscribe(`/topic/chat/room/${roomId}`, (message) => {
          const payload = JSON.parse(message.body);
          onMessageReceived(payload);
        });
      },
      onWebSocketClose: (event) => {
        console.warn('🛑 WebSocket 연결 종료:', event.reason);
        if (onDisconnect) onDisconnect();
      },
      onStompError: (err) => {
        console.error('WebSocket error:', err);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
	if (clientRef.current) {
	    clientRef.current.deactivate();
	    clientRef.current = null;
	  }
    };
  }, [roomId, onMessageReceived, onDisconnect, onConnect]);

  const sendMessage = (messageObj) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat/send',
        body: JSON.stringify(messageObj),
      });
    }
  };

  return { sendMessage };
}