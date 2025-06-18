package kr.co.cms.domain.noncur.scheduler;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.domain.noncur.constants.NoncurConstants;

@Component
public class NoncurScheduler {
    
    private final NoncurRepository programRepository;
    
    public NoncurScheduler(NoncurRepository programRepository) {
        this.programRepository = programRepository;
    }
    
    /**
     * 매일 자정에 프로그램 상태 자동 업데이트
     * - 모집중 → 마감임박 (모집 종료 3일 전)
     * - 모집중/마감임박 → 모집완료 (모집 종료일 도달)
     * - 모집완료 → 운영중 (프로그램 시작일 도달)
     * - 운영중 → 종료 (프로그램 종료일 경과)
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정
    @Transactional
    public void updateProgramStatuses() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);
        
        // 1. 마감임박으로 변경 (모집 종료 3일 전)
        List<NoncurProgram> nearDeadlinePrograms = programRepository.findProgramsNearDeadline(now, threeDaysLater);
        for (NoncurProgram program : nearDeadlinePrograms) {
            program.setPrgStatCd(NoncurConstants.ProgramStatus.DEADLINE_SOON);
            program.setUpdUserId("SYSTEM");
            programRepository.save(program);
        }
        
        // 2. 모집완료로 변경 (모집 종료일 도달)
        List<NoncurProgram> recruitingPrograms = programRepository.findByPrgStatCdIn(
            List.of(NoncurConstants.ProgramStatus.RECRUITING, NoncurConstants.ProgramStatus.DEADLINE_SOON)
        );
        for (NoncurProgram program : recruitingPrograms) {
            if (program.getPrgStDt() != null && program.getPrgStDt().isBefore(now)) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
            }
        }
        
        // 3. 운영중으로 변경 (프로그램 시작일 도달)
        List<NoncurProgram> closedPrograms = programRepository.findByPrgStatCd(
            NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED
        );
        for (NoncurProgram program : closedPrograms) {
            if (program.getPrgStDt() != null && !program.getPrgStDt().isAfter(now)) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.IN_PROGRESS);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
            }
        }
        
        // 4. 종료로 변경 (프로그램 종료일 경과)
        List<NoncurProgram> inProgressPrograms = programRepository.findByPrgStatCd(
            NoncurConstants.ProgramStatus.IN_PROGRESS
        );
        for (NoncurProgram program : inProgressPrograms) {
            if (program.getPrgEndDt() != null && program.getPrgEndDt().isBefore(now)) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.COMPLETED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
            }
        }
        
        System.out.println("프로그램 상태 자동 업데이트 완료: " + now);
    }
    
    /**
     * 매시간 정원 초과 프로그램 자동 모집완료 처리
     */
    @Scheduled(cron = "0 0 * * * *") // 매시간
    @Transactional
    public void checkCapacityAndCloseRecruitment() {
        List<NoncurProgram> recruitingPrograms = programRepository.findByPrgStatCdIn(
            List.of(NoncurConstants.ProgramStatus.RECRUITING, NoncurConstants.ProgramStatus.DEADLINE_SOON)
        );
        
        for (NoncurProgram program : recruitingPrograms) {
            Long currentApplicants = programRepository.countApprovedApplications(program.getPrgId());
            
            if (program.getMaxCnt() != null && currentApplicants >= program.getMaxCnt()) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                System.out.println("정원 초과로 모집완료 처리: " + program.getPrgId());
            }
        }
    }
}