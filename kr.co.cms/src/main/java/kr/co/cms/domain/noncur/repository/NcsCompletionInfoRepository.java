package kr.co.cms.domain.noncur.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.noncur.entity.NcsCompletionInfo;
import kr.co.cms.global.repository.IdManagedRepository;

@Repository
public interface NcsCompletionInfoRepository extends JpaRepository<NcsCompletionInfo, String>, IdManagedRepository {
    
    /**
     * IdGenerator를 위한 최대 ID 조회 메서드
     * 예: CMP20240001, CMP20240002, ... 형태로 생성
     */
    @Override
    @Query("SELECT MAX(c.cmpId) FROM NcsCompletionInfo c WHERE c.cmpId LIKE :prefix%")
    String findLatestIdByPrefix(@Param("prefix") String prefix);
    
    // 신청 ID로 이수완료 정보 조회
    NcsCompletionInfo findByAplyId(String aplyId);
    
    // 학번으로 이수완료 목록 조회
    @Query("SELECT c FROM NcsCompletionInfo c WHERE c.stdNo = :stdNo ORDER BY c.cmpDt DESC")
    java.util.List<NcsCompletionInfo> findByStdNoOrderByCmpDtDesc(@Param("stdNo") String stdNo);
    
    // 프로그램별 이수완료 수 조회
    long countByPrgId(String prgId);
    
    // 중복 이수완료 체크
    boolean existsByAplyId(String aplyId);
}