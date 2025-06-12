package kr.co.cms.domain.chat.dto;

import kr.co.cms.domain.chat.entitiy.ChatRoom;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDto {

    private String roomId;
    private String roomName;
    private String customerName;

    public static ChatRoomDto from(ChatRoom room) {
        return ChatRoomDto.builder()
                .roomId(room.getRoomId())
                .roomName(room.getRoomName())
                .customerName(room.getCustomerName())
                .build();
    }
}