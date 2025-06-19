package kr.co.cms.domain.noncur.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.noncur.entity.NoncurMap;
import kr.co.cms.domain.noncur.entity.NoncurMapId;

import java.util.List;

/**
 * 비교과 프로그램-핵심역량 매핑 Repository
 */
@Repository
public interface NoncurMapRepository extends JpaRepository<NoncurMap, NoncurMapId> {
    
    /**
     * 특정 프로그램의 모든 핵심역량 매핑 조회
     */
    List<NoncurMap> findByPrgId(String prgId);
    
    /**
     * 특정 핵심역량을 가진 모든 프로그램 매핑 조회
     */
    List<NoncurMap> findByCciId(String cciId);
    
    /**
     * 특정 프로그램의 핵심역량 ID만 조회 (문자열 리스트)
     */
    @Query("SELECT m.cciId FROM NoncurMap m WHERE m.prgId = :prgId")
    List<String> findCompetencyIdsByProgramId(@Param("prgId") String prgId);
    
    /**
     * 특정 핵심역량을 가진 프로그램 ID만 조회 (문자열 리스트)
     */
    @Query("SELECT m.prgId FROM NoncurMap m WHERE m.cciId = :cciId")
    List<String> findProgramIdsByCompetencyId(@Param("cciId") String cciId);
    
    /**
     * 프로그램-핵심역량 매핑 존재 여부 확인
     */
    boolean existsByPrgIdAndCciId(String prgId, String cciId);
    
    /**
     * 특정 프로그램의 모든 매핑 삭제
     */
    void deleteByPrgId(String prgId);
    
    /**
     * 특정 프로그램-핵심역량 매핑 삭제
     */
    void deleteByPrgIdAndCciId(String prgId, String cciId);
    
    /**
     * 프로그램별 핵심역량 개수 조회
     */
    @Query("SELECT COUNT(m) FROM NoncurMap m WHERE m.prgId = :prgId")
    Long countByProgramId(@Param("prgId") String prgId);
    
    /**
     * 핵심역량별 프로그램 개수 조회
     */
    @Query("SELECT COUNT(m) FROM NoncurMap m WHERE m.cciId = :cciId")
    Long countByCompetencyId(@Param("cciId") String cciId);
}