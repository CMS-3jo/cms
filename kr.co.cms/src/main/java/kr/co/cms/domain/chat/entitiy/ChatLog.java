package kr.co.cms.domain.chat.entitiy;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatLog {

    @Id
    private String id;

    private String roomId;

    private String senderId;     // 로그인 ID (학생 or 상담사)
    private String senderName;   // 이름
    private String senderRole;   // "ROLE_STUDENT" or "ROLE_COUNSELOR"

    private String message;      // 내용
    private LocalDateTime sentAt;
}
