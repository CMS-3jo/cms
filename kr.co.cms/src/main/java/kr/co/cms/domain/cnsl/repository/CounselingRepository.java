package kr.co.cms.domain.cnsl.repository;

import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.cnsl.entity.CounselingApply;

@Primary
@Repository
public interface CounselingRepository extends JpaRepository<CounselingApply, String>, CounselingCustomRepository {
    
}
