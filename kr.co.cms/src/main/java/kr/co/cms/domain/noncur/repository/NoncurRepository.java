package kr.co.cms.domain.noncur.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.global.repository.IdManagedRepository;

//entity class, primary key type
@Repository 
public interface NoncurRepository extends JpaRepository<NoncurProgram, String>, IdManagedRepository {
	

	// 등록자별 프로그램 조회
	List<NoncurProgram> findByRegUserId(String regUserId);

	// 등록자별 프로그램 조회 (페이징)
	Page<NoncurProgram> findByRegUserId(String regUserId, Pageable pageable);
	
	
    // 전체 조회 - 등록일 최신순 (내림차순)
    Page<NoncurProgram> findAllByOrderByRegDtDesc(Pageable pageable);
    
    
    // 검색 + 필터링 조회
    @Query("SELECT p FROM NoncurProgram p WHERE " +
           "(:keyword IS NULL OR p.prgNm LIKE %:keyword% OR p.prgDesc LIKE %:keyword%) AND " +
           "(:deptCode IS NULL OR p.prgDeptCd = :deptCode) AND " +
           "(:statusCode IS NULL OR p.prgStatCd = :statusCode)")
    Page<NoncurProgram> findBySearchConditions(
        @Param("keyword") String keyword,
        @Param("deptCode") String deptCode,
        @Param("statusCode") String statusCode,
        Pageable pageable
    );
    
    //ID생성용 조회 메서드
    @Override
    @Query("SELECT MAX(p.prgId) FROM NoncurProgram p WHERE p.prgId LIKE :prefix%")
    String findLatestIdByPrefix(@Param("prefix") String prefix);
    
    // 여러 상태의 프로그램 조회
    List<NoncurProgram> findByPrgStatCdIn(List<String> statusCodes);

    /**
     * 부서별 프로그램 목록 조회
     */
    List<NoncurProgram> findByPrgDeptCd(String prgDeptCd);

    /**
     * 부서별 프로그램 목록 조회 (페이징)
     */
    Page<NoncurProgram> findByPrgDeptCd(String prgDeptCd, Pageable pageable);

    /**
     * 상태별 프로그램 목록 조회
     */
    List<NoncurProgram> findByPrgStatCd(String prgStatCd);

    /**
     * 부서별 + 상태별 프로그램 목록 조회
     */
    List<NoncurProgram> findByPrgDeptCdAndPrgStatCd(String prgDeptCd, String prgStatCd);

    /**
     * 여러 프로그램 ID로 조회
     */
    List<NoncurProgram> findAllByPrgIdIn(List<String> prgIds);

    /**
     * 운영중인 프로그램 조회 (현재 날짜 기준)
     */
    @Query("SELECT p FROM NoncurProgram p WHERE p.prgStDt <= :currentDate AND p.prgEndDt >= :currentDate")
    List<NoncurProgram> findActivePrograms(@Param("currentDate") LocalDateTime currentDate);

    /**
     * 마감임박 프로그램 자동 업데이트용 조회
     */
    @Query("SELECT p FROM NoncurProgram p WHERE p.prgStatCd = '01' AND p.prgStDt BETWEEN :now AND :deadline")
    List<NoncurProgram> findProgramsNearDeadline(@Param("now") LocalDateTime now, @Param("deadline") LocalDateTime deadline);

    /**
     * 승인된 신청자 수 조회
     */
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd = '02'")
    Long countApprovedApplications(@Param("prgId") String prgId);
    
    
}
