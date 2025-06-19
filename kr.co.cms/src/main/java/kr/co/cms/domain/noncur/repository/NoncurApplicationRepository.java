package kr.co.cms.domain.noncur.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoncurApplicationRepository extends JpaRepository<NoncurApplication, String> {
    
    // 프로그램별 신청자 수 조회
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd IN ('01', '02')")
    Long countByProgramId(@Param("prgId") String prgId);
    
    //학생의 특정 프로그램 신청 여부 확인
    boolean existsByPrgIdAndStdNo(String prgId, String stdNo);
    
    //학생의 특정 프로그램 신청 정보 조회
    Optional<NoncurApplication> findByPrgIdAndStdNo(String prgId, String stdNo);
    
    //학생의 모든 신청 목록 조회
    List<NoncurApplication> findByStdNoOrderByAplyDtDesc(String stdNo);
    
    //프로그램의 모든 신청자 목록 조회
    List<NoncurApplication> findByPrgIdOrderByAplyDtDesc(String prgId);
    
    //상태별 신청 목록 조회
    List<NoncurApplication> findByAplyStatCdOrderByAplyDtDesc(String aplyStatCd);
    
    //프로그램별 상태별 신청자 수 조회
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd = :statusCd")
    Long countByProgramIdAndStatus(@Param("prgId") String prgId, @Param("statusCd") String statusCd);
}
