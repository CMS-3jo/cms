package kr.co.cms.domain.cnsl.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.cms.domain.cnsl.entity.CounselingSchedule;

public interface CounselingScheduleRepository extends JpaRepository<CounselingSchedule, String> {
    boolean existsByEmplNo(String emplNo);
}
