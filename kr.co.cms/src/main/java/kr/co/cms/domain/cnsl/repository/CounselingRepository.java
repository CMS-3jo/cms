package kr.co.cms.domain.cnsl.repository;


import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.entity.CounselingApply;

@Primary
@Repository
public interface CounselingRepository extends JpaRepository<CounselingApply, String>, CounselingCustomRepository {
}
