package kr.co.cms.domain.cnsl.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import kr.co.cms.domain.cnsl.dto.CounselingRecordDto;
import kr.co.cms.domain.cnsl.entity.CounselingLog;
import kr.co.cms.domain.cnsl.entity.CounselingResult;
import kr.co.cms.domain.cnsl.repository.CounselingLogRepository;
import kr.co.cms.domain.cnsl.repository.CounselingResultRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CounselingRecordService {
	
    private final CounselingLogRepository counselingLogRepository;
    private final CounselingResultRepository counselingResultRepository;

    public List<CounselingRecordDto> getRecordsByApplyId(String applyId) {
        return counselingLogRepository.findAllByCnslAplyIdOrderByCreatedAtDesc(applyId)
            .stream()
            .map(log -> CounselingRecordDto.builder()
                .title(log.getTitle())
                .content(log.getContent())
                .writer(log.getWriter())
                .createdAt(log.getCreatedAt())
                .build())
            .toList();
    }

    @Transactional
    public void saveCounselingRecord(String cnslAplyId, CounselingRecordDto request) {
        // CNSL_LOG 저장
        CounselingLog log = CounselingLog.builder()
            .cnslAplyId(cnslAplyId)
            .title(request.getTitle())
            .writer(request.getWriter())
            .content(request.getContent())
            .createdAt(LocalDateTime.now())
            .build();

        counselingLogRepository.save(log);

        // CNSL_RSLT 저장
        CounselingResult result = CounselingResult.builder()
            .cnslRsltId(UUID.randomUUID().toString())
            .cnslAplyId(cnslAplyId)
            .cnslDttm(LocalDateTime.now())
            .cnslCn(request.getContent())
            .rsltCd(request.getCategory())
            .satisfScore(BigDecimal.ZERO) // 초기값 필요 시 0점
            .build();

        counselingResultRepository.save(result);
    }
}
