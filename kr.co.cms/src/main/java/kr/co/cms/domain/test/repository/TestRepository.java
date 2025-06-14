package kr.co.cms.domain.test.repository;

import kr.co.cms.domain.test.entity.Test; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> { 
}