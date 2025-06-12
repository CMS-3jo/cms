package kr.co.cms.domain.chat.entitiy;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "chat_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id
    private String roomId;

    private String customerName;
    private String roomName;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatRoom(String customerName) {
        this.roomId = UUID.randomUUID().toString();
        this.customerName = customerName;
        this.roomName = customerName + " 상담방";
    }
}
