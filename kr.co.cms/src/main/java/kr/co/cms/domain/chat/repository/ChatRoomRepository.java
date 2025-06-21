package kr.co.cms.domain.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.chat.entitiy.ChatRoom;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
	List<ChatRoom> findByStudentIdAndActiveTrue(String studentId); // 학생이 생성한 방 목록
    List<ChatRoom> findByAssignedCounselorIdIsNullAndActiveTrue(); // 상담사 미배정 방 목록
    List<ChatRoom> findAllByOrderByCreatedAtDesc(); // 모든 방 목록
    List<ChatRoom> findAllByRoomId(String roomId);
    Optional<ChatRoom> findByRoomId(String roomId);
}
