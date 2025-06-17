package kr.co.cms.domain.cca.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.cms.domain.cca.entity.CoreCptQst;

public interface CoreCptQstRepository extends JpaRepository<CoreCptQst, String> {
    List<CoreCptQst> findByCciId(String cciId);
    List<CoreCptQst> findByCciIdOrderByQstOrdAsc(String cciId);
}