package kr.co.cms.domain.chat.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.chat.dto.ChatRoomDto;
import kr.co.cms.domain.chat.dto.CreateRoomRequestDto;
import kr.co.cms.domain.chat.entitiy.ChatRoom;
import kr.co.cms.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoomDto createRoom(CreateRoomRequestDto dto) {
        Optional<ChatRoom> existing = chatRoomRepository.findByStudentIdAndActiveTrue(dto.getStudentId());
        if (existing.isPresent()) {
            return toDto(existing.get()); // 이미 있는 방 재사용
        }

        ChatRoom room = new ChatRoom(dto.getStudentId(), dto.getCustomerName());
        ChatRoom saved = chatRoomRepository.save(room);
        return toDto(saved);
    }

    public ChatRoomDto assignCounselor(String roomId, String counselorId) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow(() -> new IllegalArgumentException("방 없음"));

        if (room.getAssignedCounselorId() != null) {
            throw new IllegalStateException("이미 상담사가 배정된 방입니다.");
        }

        room.setAssignedCounselorId(counselorId);
        return toDto(chatRoomRepository.save(room));
    }

    public boolean isUserAllowedToJoinRoom(String roomId, String userId, String role) {
        Optional<ChatRoom> roomOpt = chatRoomRepository.findById(roomId);
        if (roomOpt.isEmpty()) return false;

        ChatRoom room = roomOpt.get();

        return switch (role) {
            case "ROLE_STUDENT" -> userId.equals(room.getStudentId());
            case "ROLE_COUNSELOR" -> userId.equals(room.getAssignedCounselorId());
            default -> false;
        };
    }

    public List<ChatRoomDto> getUnassignedRooms() {
        return chatRoomRepository.findByAssignedCounselorIdIsNullAndActiveTrue().stream()
                .map(this::toDto)
                .toList();
    }

    private ChatRoomDto toDto(ChatRoom room) {
        return ChatRoomDto.builder()
                .roomId(room.getRoomId())
                .studentId(room.getStudentId())
                .customerName(room.getCustomerName())
                .roomName(room.getRoomName())
                .assignedCounselorId(room.getAssignedCounselorId())
                .active(room.isActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
