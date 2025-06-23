package kr.co.cms.domain.noncur.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import kr.co.cms.global.repository.IdManagedRepository;

import java.util.List;
import java.util.Optional;

/**
 * 비교과 프로그램 신청 Repository
 */
@Repository
public interface NoncurApplicationRepository extends JpaRepository<NoncurApplication, String>, IdManagedRepository {
	
	
    @Override
    @Query("SELECT MAX(a.aplyId) FROM NoncurApplication a WHERE a.aplyId LIKE :prefix%")
    String findLatestIdByPrefix(@Param("prefix") String prefix);
    
    /**
     * 프로그램별 신청자 수 조회 (신청완료+승인 상태만)
     */
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd IN ('01', '02')")
    Long countByProgramId(@Param("prgId") String prgId);
    
    /**
     * 학생의 특정 프로그램 신청 여부 확인
     */
    boolean existsByPrgIdAndStdNo(String prgId, String stdNo);
    
    /**
     * 학생의 특정 프로그램 신청 정보 조회
     */
    Optional<NoncurApplication> findByPrgIdAndStdNo(String prgId, String stdNo);
    
    /**
     * 학생의 모든 신청 목록 조회 (최신순)
     */
    List<NoncurApplication> findByStdNoOrderByAplyDtDesc(String stdNo);
    
    /**
     * 프로그램의 모든 신청자 목록 조회 (최신순)
     */
    List<NoncurApplication> findByPrgIdOrderByAplyDtDesc(String prgId);
    
    /**
     * 상태별 신청 목록 조회 (최신순)
     */
    List<NoncurApplication> findByAplyStatCdOrderByAplyDtDesc(String aplyStatCd);
    
    /**
     * 프로그램별 상태별 신청자 수 조회
     */
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd = :statusCd")
    Long countByProgramIdAndStatus(@Param("prgId") String prgId, @Param("statusCd") String statusCd);

    /**
     * 프로그램별 + 상태별 신청 목록 조회 (최신순)
     */
    List<NoncurApplication> findByPrgIdAndAplyStatCdOrderByAplyDtDesc(String prgId, String statusCd);

    /**
     * 프로그램별 신청 목록 조회 (페이징)
     */
    Page<NoncurApplication> findByPrgId(String prgId, Pageable pageable);

    /**
     * 프로그램별 + 상태별 신청 목록 조회 (페이징)
     */
    Page<NoncurApplication> findByPrgIdAndAplyStatCd(String prgId, String statusCd, Pageable pageable);

    /**
     * 학생별 + 상태별 신청 목록 조회 (최신순)
     */
    List<NoncurApplication> findByStdNoAndAplyStatCdOrderByAplyDtDesc(String stdNo, String statusCd);

    /**
     * 프로그램 ID로 모든 신청 조회
     */
    List<NoncurApplication> findByPrgId(String prgId);

    /**
     * 여러 신청 ID로 조회
     */
    List<NoncurApplication> findAllByAplyIdIn(List<String> aplyIds);

    /**
     * 프로그램별 상태별 신청자 수 통계
     */
    @Query("SELECT a.aplyStatCd, COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId GROUP BY a.aplyStatCd")
    List<Object[]> countByProgramIdGroupByStatus(@Param("prgId") String prgId);
    
    

     // 프로그램별 신청자 목록 조회 (학생 정보 JOIN)
    @Query("SELECT a, p.prgNm, s.stdNm, s.deptCd, s.schYr, s.phoneNumber, s.email " +
           "FROM NoncurApplication a " +
           "JOIN NoncurProgram p ON a.prgId = p.prgId " +
           "LEFT JOIN StdInfo s ON a.stdNo = s.stdNo " +
           "WHERE a.prgId = :prgId " +
           "ORDER BY a.aplyDt DESC")
    List<Object[]> findApplicationsWithDetailsOrderByAplyDtDesc(@Param("prgId") String prgId);

    //프로그램별 + 상태별 신청자 목록 조회
    @Query("SELECT a, p.prgNm, s.stdNm, s.deptCd, s.schYr, s.phoneNumber, s.email " +
           "FROM NoncurApplication a " +
           "JOIN NoncurProgram p ON a.prgId = p.prgId " +
           "LEFT JOIN StdInfo s ON a.stdNo = s.stdNo " +
           "WHERE a.prgId = :prgId AND a.aplyStatCd = :statusCd " +
           "ORDER BY a.aplyDt DESC")
    List<Object[]> findApplicationsWithDetailsByStatusOrderByAplyDtDesc(
        @Param("prgId") String prgId, 
        @Param("statusCd") String statusCd
    );

    //학생별 신청 목록 조회 (프로그램 + 부서 정보 JOIN)
    @Query("SELECT a, p.prgNm, p.prgStDt, p.prgEndDt, d.deptNm " +
           "FROM NoncurApplication a " +
           "JOIN NoncurProgram p ON a.prgId = p.prgId " +
           "LEFT JOIN DeptInfo d ON p.prgDeptCd = d.deptCd " +
           "WHERE a.stdNo = :stdNo " +
           "ORDER BY a.aplyDt DESC")
    List<Object[]> findStudentApplicationsWithDetails(@Param("stdNo") String stdNo);


    //학생별 이수완료 목록 조회 (프로그램 + 부서 + 이수완료 정보 JOIN)
    @Query("SELECT a, p.prgNm, p.prgStDt, p.prgEndDt, d.deptNm, c.cmpDt " +
           "FROM NoncurApplication a " +
           "JOIN NoncurProgram p ON a.prgId = p.prgId " +
           "LEFT JOIN DeptInfo d ON p.prgDeptCd = d.deptCd " +
           "LEFT JOIN NcsCompletionInfo c ON a.aplyId = c.aplyId " +
           "WHERE a.stdNo = :stdNo AND a.aplyStatCd = '05' " +
           "ORDER BY a.aplyDt DESC")
    List<Object[]> findStudentCompletedApplicationsWithDetails(@Param("stdNo") String stdNo);
    
}