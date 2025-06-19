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

    private String studentId;            // 학생 ID
    private String customerName;         // 학생 이름
    private String roomName;             // 방 이름
    private String assignedCounselorId;  // 상담사 ID

    private boolean active = true;       // 현재 사용 중인 방인지

    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatRoom(String studentId, String customerName) {
        this.roomId = UUID.randomUUID().toString();
        this.studentId = studentId;
        this.customerName = customerName;
        this.roomName = customerName + " 상담방";
        this.active = true;
    }
}

