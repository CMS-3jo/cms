package kr.co.cms.domain.chat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.chat.dto.ChatRoomDto;
import kr.co.cms.domain.chat.dto.CreateRoomRequestDto;
import kr.co.cms.domain.chat.entitiy.ChatRoom;
import kr.co.cms.domain.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    
    // 채팅방 생성
    @PostMapping("/api/chat/room")
    public ResponseEntity<ChatRoomDto> createRoom(@RequestBody CreateRoomRequestDto request) {
        ChatRoom room = chatRoomService.createRoom(request.getCustomerName());
        return ResponseEntity.ok(ChatRoomDto.from(room));
    }
}
