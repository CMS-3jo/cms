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

//entity class, primary key type
@Repository 
public interface NoncurRepository extends JpaRepository<NoncurProgram, String>{
	
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
}
