package kr.co.cms.domain.cnsl.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import kr.co.cms.domain.cnsl.dto.CounselingApplyRequest;
import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.dto.CounselingSearchCondition;
import kr.co.cms.domain.cnsl.entity.CounselingApply;
import kr.co.cms.domain.cnsl.repository.CounselingApplyRepository;
import kr.co.cms.domain.cnsl.repository.CounselingRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CounselingService {

    private final CounselingRepository counselingRepository;

    private final CounselingApplyRepository counselingApplyRepository;

    public String registerCounseling(CounselingApplyRequest dto) {
        CounselingApply entity = CounselingApply.builder()
            .cnslAplyId(UUID.randomUUID().toString())
            .stdNo(dto.getStdNo())
            .typeCd(dto.getTypeCd())
            .statCd(dto.getStatCd() != null ? dto.getStatCd() : "REQUESTED")
            .aplyDttm(LocalDateTime.now())
            .reqDttm(LocalDateTime.of(
                LocalDate.parse(dto.getApplyDate()),
                LocalTime.parse(dto.getApplyTime())
            ))
            .applyContent(dto.getApplyContent())
            .build();

        counselingApplyRepository.save(entity);
        return entity.getCnslAplyId();
    }
    
    public Page<CounselingListResponse> getCounselingList(CounselingSearchCondition condition, Pageable pageable) {
        return counselingRepository.findCounselingList(condition, pageable);
    }
}