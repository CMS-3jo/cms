package kr.co.cms.domain.cnsl.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import kr.co.cms.domain.cnsl.dto.CounselingScheduleCreateRequest;
import kr.co.cms.domain.cnsl.entity.CounselingSchedule;
import kr.co.cms.domain.cnsl.repository.CounselingScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CounselingScheduleService {
	
    private final CounselingScheduleRepository scheduleRepository;

    public boolean hasSchedule(String emplNo) {
        return scheduleRepository.existsByEmplNo(emplNo);
    }
    
    @Transactional
    public CounselingSchedule saveSchedule(CounselingScheduleCreateRequest request) {
        CounselingSchedule schedule = CounselingSchedule.builder()
            .schdId(UUID.randomUUID().toString())
            .cnslAplyId(request.getCnslAplyId())
            .stdNo(request.getStdNo())
            .emplNo(request.getEmplNo())
            .cnslDt(request.getCnslDt())
            .build();

        return scheduleRepository.save(schedule);
    }
}
