package kr.co.cms.domain.mileage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.mileage.entity.StudentMileageHistory;

import java.util.List;

@Repository
public interface StudentMileageHistoryRepository extends JpaRepository<StudentMileageHistory, String> {
    
    // 학생의 마일리지 히스토리 조회
    @Query("SELECT smh FROM StudentMileageHistory smh WHERE smh.stdNo = :stdNo ORDER BY smh.mlgDt DESC")
    List<StudentMileageHistory> findByStudentNoOrderByMlgDtDesc(@Param("stdNo") String stdNo);
    
    // 특정 프로그램의 마일리지 히스토리 조회
    @Query("SELECT smh FROM StudentMileageHistory smh WHERE smh.prgId = :prgId ORDER BY smh.mlgDt DESC")
    List<StudentMileageHistory> findByProgramIdOrderByMlgDtDesc(@Param("prgId") String prgId);
    
    // 학생별 최근 N개 히스토리 조회
    @Query("SELECT smh FROM StudentMileageHistory smh WHERE smh.stdNo = :stdNo ORDER BY smh.mlgDt DESC LIMIT :limit")
    List<StudentMileageHistory> findRecentHistoryByStudentNo(@Param("stdNo") String stdNo, @Param("limit") int limit);
    
    // 특정 학생의 특정 프로그램 마일리지 존재 여부 확인
    boolean existsByPrgIdAndStdNo(String prgId, String stdNo);
}