package kr.co.cms.domain.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.cms.domain.common.entity.CommonCode;

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {
    List<CommonCode> findByGroupCode(String groupCode);
    List<CommonCode> findByGroupCodeAndDescription(String groupCode, String description);
}
