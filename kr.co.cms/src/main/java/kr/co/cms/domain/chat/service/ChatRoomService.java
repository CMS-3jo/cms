package kr.co.cms.domain.chat.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.chat.dto.ChatRoomDto;
import kr.co.cms.domain.chat.dto.CreateRoomRequestDto;
import kr.co.cms.domain.chat.entitiy.ChatLog;
import kr.co.cms.domain.chat.entitiy.ChatRoom;
import kr.co.cms.domain.chat.repository.ChatLogRepository;
import kr.co.cms.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

	private final ChatRoomRepository chatRoomRepository;
	private final ChatLogRepository chatLogRepository;

	// 채팅방 생성
	public ChatRoomDto createRoom(CreateRoomRequestDto dto) {
		if (dto.getStudentId() == null || dto.getStudentId().isBlank()) {
			throw new IllegalArgumentException("studentId는 필수입니다.");
		}

		List<ChatRoom> existingRooms = chatRoomRepository.findByStudentIdAndActiveTrue(dto.getStudentId());
		if (!existingRooms.isEmpty()) {
			ChatRoom latest = existingRooms.stream().max(Comparator.comparing(ChatRoom::getCreatedAt))
					.orElse(existingRooms.get(0));
			return toDto(latest);
		}

		ChatRoom newRoom = new ChatRoom(dto.getStudentId(), dto.getCustomerName());
		return toDto(chatRoomRepository.save(newRoom));
	}

	// 상담사 배정
	public ChatRoomDto assignCounselor(String roomId, String counselorId) {
		ChatRoom room = findLatestRoomByRoomId(roomId);
		if (room.getAssignedCounselorId() != null) {
			throw new IllegalStateException("이미 상담사가 배정된 방입니다.");
		}

		room.setAssignedCounselorId(counselorId);
		room.setActive(true);
		return toDto(chatRoomRepository.save(room));
	}

	// 방 입장 가능 여부
	public boolean isUserAllowedToJoinRoom(String roomId, String userId, String role) {
		ChatRoom room = findLatestRoomByRoomId(roomId);

		if (role.equals("ROLE_COUNSELOR") && room.getAssignedCounselorId() != null
				&& !userId.equals(room.getAssignedCounselorId())) {
			return false; // 이미 다른 상담사 있음
		}

		return switch (role) {
		case "ROLE_STUDENT" -> userId.equals(room.getStudentId());
		case "ROLE_COUNSELOR" -> userId.equals(room.getAssignedCounselorId());
		default -> false;
		};
	}
	
	public ChatRoomDto getRoomByRoomId(String roomId) {
	    ChatRoom room = findLatestRoomByRoomId(roomId);
	    return toDto(room);
	}

	// 상담사 미배정 방 목록
	public List<ChatRoomDto> getUnassignedRooms() {
		return chatRoomRepository.findByAssignedCounselorIdIsNullAndActiveTrue().stream().map(this::toDto).toList();
	}

	// 상담사 전체 방 목록 (중복 제거)
	public List<ChatRoomDto> getAllChatRoomsForCounselor() {
		List<ChatRoom> rooms = chatRoomRepository.findAllByOrderByCreatedAtDesc();

		// studentId 기준으로 가장 최근 방만 남김
		Map<String, ChatRoom> uniqueRooms = new LinkedHashMap<>();
		for (ChatRoom room : rooms) {
			if (room.getStudentId() == null)
				continue;
			uniqueRooms.putIfAbsent(room.getStudentId(), room);
		}

		return uniqueRooms.values().stream().map(room -> {
			ChatLog last = chatLogRepository.findTopByRoomIdOrderBySentAtDesc(room.getRoomId());

			return ChatRoomDto.builder().roomId(room.getRoomId()).studentId(room.getStudentId())
					.customerName(room.getCustomerName()).roomName(room.getRoomName())
					.assignedCounselorId(room.getAssignedCounselorId()).active(room.isActive())
					.createdAt(room.getCreatedAt()).status(determineRoomStatus(room))
					.lastMessage(last != null ? last.getMessage() : null)
					.lastMessageTime(last != null ? last.getSentAt() : null).build();
		}).collect(Collectors.toList());
	}

	// 방 나가기 (비활성화 처리)
	public void leaveRoom(String roomId) {
		ChatRoom room = findLatestRoomByRoomId(roomId);
		room.setActive(false);
		chatRoomRepository.save(room);
	}

	// 내부: 중복된 roomId 대비 방어용 안전한 조회
	private ChatRoom findLatestRoomByRoomId(String roomId) {
		List<ChatRoom> rooms = chatRoomRepository.findAllByRoomId(roomId);
		if (rooms.isEmpty()) {
			throw new IllegalArgumentException("방 없음");
		}

		return rooms.stream().max(Comparator.comparing(ChatRoom::getCreatedAt)).orElseThrow();
	}

	// 상태 계산
	private String determineRoomStatus(ChatRoom room) {
		if (!room.isActive())
			return "COMPLETED";
		else if (room.getAssignedCounselorId() == null)
			return "WAITING";
		else
			return "ACTIVE";
	}

	// 엔티티 → DTO 변환
	private ChatRoomDto toDto(ChatRoom room) {
		return ChatRoomDto.builder().roomId(room.getRoomId()).studentId(room.getStudentId())
				.customerName(room.getCustomerName()).roomName(room.getRoomName())
				.assignedCounselorId(room.getAssignedCounselorId()).active(room.isActive())
				.createdAt(room.getCreatedAt()).status(determineRoomStatus(room)).build();
	}
}
