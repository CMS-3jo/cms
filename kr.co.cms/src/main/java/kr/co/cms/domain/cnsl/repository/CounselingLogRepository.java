package kr.co.cms.domain.cnsl.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.cms.domain.cnsl.entity.CounselingLog;

public interface CounselingLogRepository extends JpaRepository<CounselingLog, Long> {
	List<CounselingLog> findAllByCnslAplyIdOrderByCreatedAtDesc(String cnslAplyId);
}
