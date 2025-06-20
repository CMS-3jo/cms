package kr.co.cms.domain.chat.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import kr.co.cms.domain.chat.entitiy.ChatLog;

import java.util.List;


public interface ChatLogRepository extends MongoRepository<ChatLog, String> {
    List<ChatLog> findByRoomIdOrderBySentAt(String roomId);
    
    // 특정 방의 마지막 메시지
    ChatLog findTopByRoomIdOrderBySentAtDesc(String roomId);

    // 특정 방에서 상담사가 안 읽은 메시지 수
    @Query("{ 'roomId': ?0, 'senderId': { $ne: ?1 }, 'readBy': { $ne: ?1 } }")
    int countByRoomIdAndUnreadForUser(String roomId, String userId);
}