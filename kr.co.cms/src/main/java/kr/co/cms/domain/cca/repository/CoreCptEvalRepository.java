package kr.co.cms.domain.cca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.cca.entity.CoreCptEval;

@Repository
public interface CoreCptEvalRepository extends JpaRepository<CoreCptEval, String> {

    /**
     * stdNo, coreCptQst.coreCptInfo.cciId 로 답안 조회
     */
    List<CoreCptEval> findByStdNoAndCoreCptQst_CoreCptInfo_CciId(String stdNo, String cciId);
}
