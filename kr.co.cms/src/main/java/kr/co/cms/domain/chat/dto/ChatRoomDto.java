package kr.co.cms.domain.chat.dto;

import java.time.LocalDateTime;

import kr.co.cms.domain.chat.entitiy.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatRoomDto {
    private String roomId;
    private String studentId;
    private String customerName;
    private String roomName;
    private String assignedCounselorId;
    private boolean active;
    private LocalDateTime createdAt;
    
    private String status;
    
    private String lastMessage;           
    private LocalDateTime lastMessageTime;
    private int unreadCount;  
}