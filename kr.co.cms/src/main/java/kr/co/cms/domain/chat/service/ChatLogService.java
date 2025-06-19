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

    public void processMessage(ChatMessageDto dto) {
        ChatLog log = ChatLog.builder()
            .roomId(dto.getRoomId())
            .senderId(dto.getSenderId())
            .senderName(dto.getSenderName())
            .senderRole(dto.getSenderRole())  // 추가 필요
            .message(dto.getContent())
            .sentAt(LocalDateTime.now())
            .build();

        chatLogRepository.save(log);
    }
}

