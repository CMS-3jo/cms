package kr.co.cms.domain.noncur.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import kr.co.cms.domain.noncur.entity.NoncurProgram;

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
    

 // 프로그램별 + 상태별 신청 목록 조회
 List<NoncurApplication> findByPrgIdAndAplyStatCdOrderByAplyDtDesc(String prgId, String statusCd);

 // 프로그램별 신청 목록 조회 (페이징)
 Page<NoncurApplication> findByPrgId(String prgId, Pageable pageable);

 // 프로그램별 + 상태별 신청 목록 조회 (페이징)
 Page<NoncurApplication> findByPrgIdAndAplyStatCd(String prgId, String statusCd, Pageable pageable);

 // 학생별 + 상태별 신청 목록 조회
 List<NoncurApplication> findByStdNoAndAplyStatCdOrderByAplyDtDesc(String stdNo, String statusCd);

 // 프로그램 ID로 모든 신청 조회
 List<NoncurApplication> findByPrgId(String prgId);

 // 여러 신청 ID로 조회
 List<NoncurApplication> findAllByAplyIdIn(List<String> aplyIds);

 // 프로그램별 상태별 신청자 수 통계
 @Query("SELECT a.aplyStatCd, COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId GROUP BY a.aplyStatCd")
 List<Object[]> countByProgramIdGroupByStatus(@Param("prgId") String prgId);

 // 부서별 신청 통계
 @Query("SELECT p.prgDeptCd, COUNT(a) FROM NoncurApplication a " +
        "JOIN NoncurProgram p ON a.prgId = p.prgId " +
        "WHERE p.prgDeptCd = :deptCd " +
        "GROUP BY p.prgDeptCd")
 Long countByDepartment(@Param("deptCd") String deptCd);


 // NoncurRepository에 추가할 메소드들

 // 부서별 프로그램 목록 조회
 List<NoncurProgram> findByPrgDeptCd(String prgDeptCd);

 // 부서별 프로그램 목록 조회 (페이징)
 Page<NoncurProgram> findByPrgDeptCd(String prgDeptCd, Pageable pageable);

 // 상태별 프로그램 목록 조회
 List<NoncurProgram> findByPrgStatCd(String prgStatCd);

 // 부서별 + 상태별 프로그램 목록 조회
 List<NoncurProgram> findByPrgDeptCdAndPrgStatCd(String prgDeptCd, String prgStatCd);

 // 여러 프로그램 ID로 조회
 List<NoncurProgram> findAllByPrgIdIn(List<String> prgIds);

 // 부서별 프로그램 수 통계
 @Query("SELECT p.prgDeptCd, COUNT(p) FROM NoncurProgram p GROUP BY p.prgDeptCd")
 List<Object[]> countByDepartment();

 // 상태별 프로그램 수 통계
 @Query("SELECT p.prgStatCd, COUNT(p) FROM NoncurProgram p GROUP BY p.prgStatCd")
 List<Object[]> countByStatus();

 // 운영중인 프로그램 조회 (현재 날짜 기준)
 @Query("SELECT p FROM NoncurProgram p WHERE p.prgStDt <= :currentDate AND p.prgEndDt >= :currentDate")
 List<NoncurProgram> findActivePrograms(@Param("currentDate") LocalDateTime currentDate);

 // 마감임박 프로그램 자동 업데이트용 조회
 @Query("SELECT p FROM NoncurProgram p WHERE p.prgStatCd = '01' AND p.prgStDt BETWEEN :now AND :deadline")
 List<NoncurProgram> findProgramsNearDeadline(@Param("now") LocalDateTime now, @Param("deadline") LocalDateTime deadline);
    
    
    
}
