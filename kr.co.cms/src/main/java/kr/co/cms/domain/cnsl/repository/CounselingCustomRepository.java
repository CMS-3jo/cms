package kr.co.cms.domain.cnsl.repository;

import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.dto.CounselingSearchCondition;
import org.springframework.data.domain.*;

public interface CounselingCustomRepository {
    Page<CounselingListResponse> findCounselingList(CounselingSearchCondition condition, Pageable pageable);
}
