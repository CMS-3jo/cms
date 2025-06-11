package kr.co.cms.noncur;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

//entity class, primary key type
public interface NoncurRepository extends JpaRepository<NoncurProgram, String>{
	
	// 전체 조회 - 등록일 최신순 (내림차순)
    Page<NoncurProgram> findAllByOrderByRegDtDesc(Pageable pageable);
    
    //검색 + 필터링 조회
    @Query("SELECT p FROM NoncurProgram p WHERE " +
            "(:keyword IS NULL OR p.prgNm LIKE %:keyword% OR p.prgDesc LIKE %:keyword%) AND " +
            "(:deptCode IS NULL OR p.prgDeptCd = :deptCode) AND " +
            "(:status IS NULL OR p.stauts = :status)")
     Page<NoncurProgram> findBySearchConditions(
         @Param("keyword") String keyword,
         @Param("deptCode") String deptCode,
         @Param("status") NoncurEnum.Status status,
         Pageable pageable
     );
}
