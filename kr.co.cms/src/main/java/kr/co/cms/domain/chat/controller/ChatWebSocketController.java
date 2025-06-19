package kr.co.cms.domain.chat.controller;

import kr.co.cms.domain.chat.dto.ChatMessageDto;
import kr.co.cms.domain.chat.service.ChatLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatLogService chatLogService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/send") // 클라이언트에서 /app/chat/send 로 전송
    public void handleMessage(ChatMessageDto message) {
        // 서버에서 시간 강제 세팅
        message.setTimestamp(LocalDateTime.now());

        // 저장
        chatLogService.processMessage(message);

        // /topic/chat/{roomId} 로 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), message);
    }
    
    @MessageMapping("/chat/echo")
    public void echo(ChatMessageDto message) {
        System.out.println("받은 메시지: " + message.getContent());
    }
    
    
}