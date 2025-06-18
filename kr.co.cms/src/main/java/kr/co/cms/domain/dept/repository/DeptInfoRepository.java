// src/main/java/kr/co/cms/domain/dept/repository/DeptInfoRepository.java
package kr.co.cms.domain.dept.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.dept.entity.DeptInfo;

@Repository
public interface DeptInfoRepository extends JpaRepository<DeptInfo, String> {
    List<DeptInfo> findByDeptCdStartingWith(String prefix);
}