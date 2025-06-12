package kr.co.cms.domain.chat.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import kr.co.cms.domain.chat.entitiy.ChatLog;

import java.util.List;


public interface ChatLogRepository extends MongoRepository<ChatLog, String> {
    List<ChatLog> findByRoomIdOrderBySentAt(String roomId);
}