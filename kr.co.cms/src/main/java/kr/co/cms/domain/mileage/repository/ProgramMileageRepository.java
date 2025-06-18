package kr.co.cms.domain.mileage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.mileage.entity.ProgramMileage;
import java.util.List;

@Repository
public interface ProgramMileageRepository extends JpaRepository<ProgramMileage, String> {
    
    // 프로그램별 마일리지 조회
    @Query("SELECT pm FROM ProgramMileage pm WHERE pm.prgId = :prgId")
    ProgramMileage findByProgramId(@Param("prgId") String prgId);
    
    // 마일리지가 설정된 모든 프로그램 조회
    @Query("SELECT pm FROM ProgramMileage pm ORDER BY pm.regDt DESC")
    List<ProgramMileage> findAllOrderByRegDtDesc();
}
