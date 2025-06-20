package kr.co.cms.domain.cnsl.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.cms.domain.cnsl.entity.CounselingApply;

public interface CounselingApplyRepository extends JpaRepository<CounselingApply, String> {
	@Query(value = "SELECT DATE_FORMAT(REQ_DTTM, '%H:%i:%s') FROM CNSL_APLY WHERE DATE(REQ_DTTM) = STR_TO_DATE(:date, '%Y-%m-%d')", nativeQuery = true)
	List<String> findReservedTimesByDate(@Param("date") String date);
}
