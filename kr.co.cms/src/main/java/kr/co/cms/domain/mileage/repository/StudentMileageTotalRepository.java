package kr.co.cms.domain.mileage.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.mileage.entity.StudentMileageTotal;

import java.util.List;

@Repository
public interface StudentMileageTotalRepository extends JpaRepository<StudentMileageTotal, String> {
    
    // 학생별 총 마일리지 조회
    @Query("SELECT smt FROM StudentMileageTotal smt WHERE smt.stdNo = :stdNo")
    StudentMileageTotal findByStudentNo(@Param("stdNo") String stdNo);
    
    // 마일리지 순위 조회 (상위 N명)
    @Query("SELECT smt FROM StudentMileageTotal smt ORDER BY smt.totMlgScore DESC LIMIT :limit")
    List<StudentMileageTotal> findTopStudentsByMileage(@Param("limit") int limit);
}
