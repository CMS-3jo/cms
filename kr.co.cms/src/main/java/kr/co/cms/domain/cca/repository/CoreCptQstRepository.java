package kr.co.cms.domain.cca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.cca.entity.CoreCptQst;

@Repository
public interface CoreCptQstRepository extends JpaRepository<CoreCptQst, String> {

    /**
     * CoreCptInfo(cciId)로 문항 조회
     */
    List<CoreCptQst> findByCoreCptInfo_CciId(String cciId);

    /**
     * CoreCptInfo(cciId)로 문항 조회 + qstOrd 오름차순 정렬
     */
    List<CoreCptQst> findByCoreCptInfo_CciIdOrderByQstOrdAsc(String cciId);
}
