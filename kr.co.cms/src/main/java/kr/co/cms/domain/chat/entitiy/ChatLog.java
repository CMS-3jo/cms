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
    private String sender;
    private String message;
    private LocalDateTime sentAt;
}
