package kr.co.cms.domain.cnsl.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.cms.domain.cnsl.dto.CalendarEventDto;
import kr.co.cms.domain.cnsl.entity.CounselingSchedule;

public interface CounselingScheduleRepository extends JpaRepository<CounselingSchedule, String> {
    boolean existsByEmplNo(String emplNo);
    boolean existsByCnslAplyId(String cnslAplyId);
    
    @Query(value = """
    	    SELECT 
    	        s.CNSL_DT as cnslDt,
    	        s.STD_NO as studentNo,
    	        s.EMPL_NO as counselorId,
    	        s.CNSL_APLY_ID as cnslAplyId,
    	        std.STD_NM as studentName
    	    FROM CNSL_SCHD s
    	    JOIN STD_INFO std ON s.STD_NO = std.STD_NO
    	    WHERE s.EMPL_NO = :emplNo
    	      AND s.CNSL_DT BETWEEN :start AND :end
    	""", nativeQuery = true)
    	List<CalendarEventDto> findEventsWithStudentName(
    	    @Param("emplNo") String emplNo,
    	    @Param("start") LocalDateTime start,
    	    @Param("end") LocalDateTime end
    	);
}
