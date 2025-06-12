package kr.co.cms.domain.chat.service;

import java.time.LocalDateTime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import kr.co.cms.domain.chat.dto.ChatMessageDto;
import kr.co.cms.domain.chat.entitiy.ChatLog;
import kr.co.cms.domain.chat.repository.ChatLogRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatLogService {

    private final ChatLogRepository chatLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void processMessage(ChatMessageDto message) {
        // 현재 시각 기준 시간 생성
        LocalDateTime now = LocalDateTime.now();

        // 1. MongoDB 저장
        ChatLog chatLog = ChatLog.builder()
                .roomId(message.getRoomId())
                .sender(message.getSender())
                .message(message.getMessage())
                .sentAt(now)
                .build();
        chatLogRepository.save(chatLog);

        // 2. 메시지 DTO에도 sentAt 세팅
        message.setSentAt(now);

        // 3. WebSocket 전송 → 방 별로 전송
        messagingTemplate.convertAndSend("/topic/chat/room/" + message.getRoomId(), message);
    }
}

