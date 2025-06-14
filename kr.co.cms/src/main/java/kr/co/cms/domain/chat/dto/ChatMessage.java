package kr.co.cms.domain.chat.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {
    private String roomId;     // 채팅방 ID
    private String sender;     // 보낸 사람
    private String message;    // 메시지 내용
    private LocalDateTime sentAt; // 보낸 시각
}