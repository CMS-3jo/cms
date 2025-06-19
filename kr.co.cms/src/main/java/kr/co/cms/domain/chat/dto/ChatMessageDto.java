package kr.co.cms.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private String roomId;

    private String senderId;     // 로그인 유저 ID
    private String senderName;   // 이름
    private String senderRole;   // ROLE_STUDENT or ROLE_COUNSELOR

    private String content;      // 메시지
    private LocalDateTime timestamp; // 클라이언트 기준 시간
}
