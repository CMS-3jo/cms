package kr.co.cms.domain.chat.controller;

import kr.co.cms.domain.chat.dto.ChatMessageDto;
import kr.co.cms.domain.chat.service.ChatLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
	
	private final ChatLogService chatLogService;
	
    @MessageMapping("/chat/send")   // 클라이언트에서 /app/chat/send로 전송
    public void handleMessage(ChatMessageDto message) {
    	chatLogService.processMessage(message); // 저장 + 전송
    	// return 불필요: 브로드캐스트는 SimpMessagingTemplate에서 이미 처리
    }
}