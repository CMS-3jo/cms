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
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정
    @Transactional
    public void updateProgramStatuses() {
        LocalDateTime now = LocalDateTime.now();
        
        System.out.println("=== 프로그램 상태 자동 업데이트 시작: " + now + " ===");
        
        // 1. 모집 종료일이 지난 프로그램들을 모집완료로 변경
        updateRecruitmentClosed(now);
        
        // 2. 프로그램 시작일이 된 모집완료 프로그램들을 운영중으로 변경
        updateToInProgress(now);
        
        // 3. 프로그램 종료일이 지난 운영중 프로그램들을 종료로 변경
        updateToCompleted(now);
        
        // 4. 마감임박 상태 업데이트 (모집 종료 3일 전)
        updateToDeadlineSoon(now);
        
        System.out.println("=== 프로그램 상태 자동 업데이트 완료 ===");
    }
    
    /**
     * 모집 종료일이 지난 프로그램들을 모집완료로 변경
     */
    private void updateRecruitmentClosed(LocalDateTime now) {
        List<NoncurProgram> recruitingPrograms = programRepository.findByPrgStatCdIn(
            List.of(NoncurConstants.ProgramStatus.RECRUITING, 
                   NoncurConstants.ProgramStatus.DEADLINE_SOON)
        );
        
        int updatedCount = 0;
        for (NoncurProgram program : recruitingPrograms) {
            // 모집 종료일 = 프로그램 시작일 - 1일 (또는 별도 컬럼이 있다면 그것 사용)
            LocalDateTime recruitmentEndDate = program.getPrgStDt().minusDays(1);
            
            if (now.isAfter(recruitmentEndDate)) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                updatedCount++;
                System.out.println("모집완료로 변경: " + program.getPrgId() + " - " + program.getPrgNm());
            }
        }
        System.out.println("모집완료 변경 건수: " + updatedCount);
    }
    
    /**
     * 프로그램 시작일이 된 모집완료 프로그램들을 운영중으로 변경
     */
    private void updateToInProgress(LocalDateTime now) {
        List<NoncurProgram> closedPrograms = programRepository.findByPrgStatCd(
            NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED
        );
        
        int updatedCount = 0;
        for (NoncurProgram program : closedPrograms) {
            if (program.getPrgStDt() != null && 
                (now.isEqual(program.getPrgStDt()) || now.isAfter(program.getPrgStDt()))) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.IN_PROGRESS);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                updatedCount++;
                System.out.println("운영중으로 변경: " + program.getPrgId() + " - " + program.getPrgNm());
            }
        }
        System.out.println("운영중 변경 건수: " + updatedCount);
    }
    
    /**
     * 프로그램 종료일이 지난 운영중 프로그램들을 종료로 변경
     */
    private void updateToCompleted(LocalDateTime now) {
        List<NoncurProgram> inProgressPrograms = programRepository.findByPrgStatCd(
            NoncurConstants.ProgramStatus.IN_PROGRESS
        );
        
        int updatedCount = 0;
        for (NoncurProgram program : inProgressPrograms) {
            if (program.getPrgEndDt() != null && now.isAfter(program.getPrgEndDt())) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.COMPLETED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                updatedCount++;
                System.out.println("종료로 변경: " + program.getPrgId() + " - " + program.getPrgNm());
            }
        }
        System.out.println("종료 변경 건수: " + updatedCount);
    }
    
    /**
     * 마감임박 상태 업데이트 (모집 종료 3일 전)
     */
    private void updateToDeadlineSoon(LocalDateTime now) {
        List<NoncurProgram> recruitingPrograms = programRepository.findByPrgStatCd(
            NoncurConstants.ProgramStatus.RECRUITING
        );
        
        int updatedCount = 0;
        for (NoncurProgram program : recruitingPrograms) {
            LocalDateTime recruitmentEndDate = program.getPrgStDt().minusDays(1);
            LocalDateTime threeDaysBefore = recruitmentEndDate.minusDays(3);
            
            if (now.isAfter(threeDaysBefore) && now.isBefore(recruitmentEndDate)) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.DEADLINE_SOON);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                updatedCount++;
                System.out.println("마감임박으로 변경: " + program.getPrgId() + " - " + program.getPrgNm());
            }
        }
        System.out.println("마감임박 변경 건수: " + updatedCount);
    }
    
    /**
     * 매시간 정원 초과 프로그램 자동 모집완료 처리
     */
    @Scheduled(cron = "0 0 * * * *") // 매시간
    @Transactional
    public void checkCapacityAndCloseRecruitment() {
        List<NoncurProgram> recruitingPrograms = programRepository.findByPrgStatCdIn(
            List.of(NoncurConstants.ProgramStatus.RECRUITING,
                   NoncurConstants.ProgramStatus.DEADLINE_SOON)
        );
        
        int updatedCount = 0;
        for (NoncurProgram program : recruitingPrograms) {
            Long currentApplicants = programRepository.countApprovedApplications(program.getPrgId());
            
            if (program.getMaxCnt() != null && currentApplicants >= program.getMaxCnt()) {
                program.setPrgStatCd(NoncurConstants.ProgramStatus.RECRUITMENT_CLOSED);
                program.setUpdUserId("SYSTEM");
                programRepository.save(program);
                updatedCount++;
                System.out.println("정원 초과로 모집완료 처리: " + program.getPrgId() + 
                                 " (현재: " + currentApplicants + "명 / 정원: " + program.getMaxCnt() + "명)");
            }
        }
        
        if (updatedCount > 0) {
            System.out.println("정원 초과 모집완료 처리 건수: " + updatedCount);
        }
    }
}