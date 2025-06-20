package kr.co.cms.domain.chat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.chat.dto.ChatMessageDto;
import kr.co.cms.domain.chat.dto.ChatRoomDto;
import kr.co.cms.domain.chat.dto.CreateRoomRequestDto;
import kr.co.cms.domain.chat.entitiy.ChatRoom;
import kr.co.cms.domain.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @PostMapping
    public ResponseEntity<ChatRoomDto> createRoom(@RequestBody CreateRoomRequestDto dto) {
        return ResponseEntity.ok(chatRoomService.createRoom(dto));
    }

    @PatchMapping("/{roomId}/assign")
    public ResponseEntity<ChatRoomDto> assignCounselor(@PathVariable String roomId, @RequestBody ChatRoomDto dto) {
        return ResponseEntity.ok(chatRoomService.assignCounselor(roomId, dto.getAssignedCounselorId()));
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<ChatRoomDto>> getUnassignedRooms() {
        return ResponseEntity.ok(chatRoomService.getUnassignedRooms());
    }
}