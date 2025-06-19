package kr.co.cms.domain.cnsl.service;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cnsl.repository.CounselingScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CounselingScheduleService {
	
    private final CounselingScheduleRepository scheduleRepository;

    public boolean hasSchedule(String emplNo) {
        return scheduleRepository.existsByEmplNo(emplNo);
    }
}
