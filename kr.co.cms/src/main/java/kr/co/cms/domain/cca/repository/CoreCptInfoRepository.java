package kr.co.cms.domain.cca.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import kr.co.cms.domain.cca.entity.CoreCptInfo;

public interface CoreCptInfoRepository extends JpaRepository<CoreCptInfo, String> {
}