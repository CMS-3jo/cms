package kr.co.cms.domain.noncur.repository;

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
	
    // 전체 조회 - 등록일 최신순 (내림차순)
    Page<NoncurProgram> findAllByOrderByRegDtDesc(Pageable pageable);
    
    // 부서명 조회 (네이티브 쿼리)
    @Query(value = "SELECT DEPT_NM FROM DEPT_INFO WHERE DEPT_CD = :deptCode", nativeQuery = true)
    String findDeptNameByCode(@Param("deptCode") String deptCode);
    
    // 모든부서명
    @Query(value = "SELECT DEPT_CD, DEPT_NM FROM DEPT_INFO ORDER BY DEPT_NM", 
    	       nativeQuery = true)
    	List<Object[]> findAllDepartmentsNative();

    
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

    // 승인된 신청자 수 조회
    @Query("SELECT COUNT(a) FROM NoncurApplication a WHERE a.prgId = :prgId AND a.aplyStatCd = '02'")
    Long countApprovedApplications(@Param("prgId") String prgId);
    
}
