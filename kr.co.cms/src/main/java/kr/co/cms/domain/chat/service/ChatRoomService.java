package kr.co.cms.domain.chat.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.chat.entitiy.ChatRoom;
import kr.co.cms.domain.chat.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom createRoom(String customerName) {
        ChatRoom room = new ChatRoom(customerName);
        return chatRoomRepository.save(room);
    }

    public Optional<ChatRoom> findById(String roomId) {
        return chatRoomRepository.findById(roomId);
    }
}
