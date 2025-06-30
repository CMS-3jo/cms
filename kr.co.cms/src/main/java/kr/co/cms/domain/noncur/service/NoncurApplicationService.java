package kr.co.cms.domain.noncur.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.noncur.constants.NoncurApplicationConstants;
import kr.co.cms.domain.noncur.dto.NoncurApplicationDTO;
import kr.co.cms.domain.noncur.dto.NoncurApplicationRequestDTO;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import kr.co.cms.domain.noncur.repository.NoncurApplicationRepository;
import kr.co.cms.global.util.IdGenerator;

@Service
@Transactional(readOnly = true)
public class NoncurApplicationService {
    
    private final NoncurApplicationRepository applicationRepository;
    
    public NoncurApplicationService(NoncurApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }
    
    /**
     * 프로그램 신청
     */
    @Transactional
    public NoncurApplicationDTO applyProgram(String prgId, String stdNo, NoncurApplicationRequestDTO requestDTO) {
        // 중복 신청 체크
        if (applicationRepository.existsByPrgIdAndStdNo(prgId, stdNo)) {
            throw new IllegalStateException("이미 신청한 프로그램입니다.");
        }
        
        // 신청 ID 생성 - IdGenerator 사용
        String aplyId = IdGenerator.generate("APLY", applicationRepository);
        System.out.println("생성된 신청 ID: " + aplyId + " (길이: " + aplyId.length() + ")");
        
        // 신청 정보 생성
        NoncurApplication application = new NoncurApplication(
            aplyId,
            prgId,
            stdNo,
            requestDTO.getAplySelCd() != null ? requestDTO.getAplySelCd() : "01"
        );
        
        // 저장
        NoncurApplication savedApplication = applicationRepository.save(application);
        
        // DTO 변환 후 반환
        return convertToDTO(savedApplication);
    }
    
    
    
    /**
     * 신청 취소
     */
    @Transactional
    public void cancelApplication(String prgId, String stdNo) {
        Optional<NoncurApplication> applicationOpt = 
            applicationRepository.findByPrgIdAndStdNo(prgId, stdNo);
        
        if (applicationOpt.isEmpty()) {
            throw new IllegalArgumentException("신청 정보를 찾을 수 없습니다.");
        }
        
        NoncurApplication application = applicationOpt.get();
        
        // 취소 가능한 상태인지 확인
        if (!NoncurApplicationConstants.ApplicationStatus.APPLIED.equals(application.getAplyStatCd())) {
            throw new IllegalStateException("취소할 수 없는 상태입니다.");
        }
        
        // 상태를 취소로 변경
        application.setAplyStatCd(NoncurApplicationConstants.ApplicationStatus.CANCELLED);
        applicationRepository.save(application);
    }
    
    /**
     * 프로그램별 현재 신청자 수 조회
     */
    public Long getCurrentApplicantCount(String prgId) {
        return applicationRepository.countByProgramId(prgId);
    }
    
    /**
     * 학생의 신청 여부 확인
     */
    public boolean isApplied(String prgId, String stdNo) {
        return applicationRepository.existsByPrgIdAndStdNo(prgId, stdNo);
    }
    
    /**
     * 학생의 신청 목록 조회
     */
    public List<NoncurApplicationDTO> getStudentApplications(String stdNo) {
        List<Object[]> results = applicationRepository.findStudentApplicationsWithDetails(stdNo);
        
        return results.stream()
            .map(this::convertJoinResultToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 프로그램의 신청자 목록 조회
     */
    public List<NoncurApplicationDTO> getProgramApplications(String prgId) {
        List<NoncurApplication> applications = 
            applicationRepository.findByPrgIdOrderByAplyDtDesc(prgId);
        
        return applications.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 신청 ID 생성
     */
    private String generateApplicationId() {
        return "APLY" + LocalDateTime.now().format(
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        ) + String.format("%03d", (int)(Math.random() * 1000));
    }
    
    /**
     * Entity to DTO 변환
     */
    private NoncurApplicationDTO convertToDTO(NoncurApplication application) {
        NoncurApplicationDTO dto = new NoncurApplicationDTO();
        dto.setAplyId(application.getAplyId());
        dto.setPrgId(application.getPrgId());
        dto.setStdNo(application.getStdNo());
        dto.setAplySelCd(application.getAplySelCd());
        dto.setAplyDt(application.getAplyDt());
        dto.setAplyStatCd(application.getAplyStatCd());
        dto.setAplyStatNm(NoncurApplicationConstants.getStatusName(application.getAplyStatCd()));
        return dto;
    }
    
    /**
     * 학생의 이수완료 프로그램 목록 조회
     */
    public List<NoncurApplicationDTO> getStudentCompletedApplications(String stdNo) {
        List<Object[]> results = applicationRepository.findStudentCompletedApplicationsWithDetails(stdNo);
        
        return results.stream()
            .map(this::convertCompletedJoinResultToDTO)
            .collect(Collectors.toList());
    }

    
    
    /**
     * JOIN 결과를 DTO로 변환 (신청 목록용)
     */
    private NoncurApplicationDTO convertJoinResultToDTO(Object[] result) {
        NoncurApplication application = (NoncurApplication) result[0];
        String prgNm = (String) result[1];          // NoncurProgram.prgNm
        LocalDateTime prgStDt = (LocalDateTime) result[2];  // 프로그램 시작일
        LocalDateTime prgEndDt = (LocalDateTime) result[3]; // 프로그램 종료일
        String deptNm = (String) result[4];         // DeptInfo.deptNm (부서명)
        
        NoncurApplicationDTO dto = new NoncurApplicationDTO();
        dto.setAplyId(application.getAplyId());
        dto.setPrgId(application.getPrgId());
        dto.setPrgNm(prgNm); // JOIN으로 가져온 프로그램명 ✅
        dto.setStdNo(application.getStdNo());
        dto.setAplySelCd(application.getAplySelCd());
        dto.setAplyDt(application.getAplyDt());
        dto.setAplyStatCd(application.getAplyStatCd());
        dto.setAplyStatNm(NoncurApplicationConstants.getStatusName(application.getAplyStatCd()));
        
        
        return dto;
    }

    /**
     * JOIN 결과를 DTO로 변환 (이수완료 목록용)
     */
    private NoncurApplicationDTO convertCompletedJoinResultToDTO(Object[] result) {
        NoncurApplication application = (NoncurApplication) result[0];
        String prgNm = (String) result[1];          // 프로그램명
        LocalDateTime prgStDt = (LocalDateTime) result[2];  // 프로그램 시작일
        LocalDateTime prgEndDt = (LocalDateTime) result[3]; // 프로그램 종료일
        String deptNm = (String) result[4];         // 부서명
        LocalDateTime cmpDt = (LocalDateTime) result[5];    // 이수완료일
        
        NoncurApplicationDTO dto = new NoncurApplicationDTO();
        dto.setAplyId(application.getAplyId());
        dto.setPrgId(application.getPrgId());
        dto.setPrgNm(prgNm);  //프로그램명 
        dto.setStdNo(application.getStdNo());
        dto.setAplySelCd(application.getAplySelCd());
        dto.setAplyDt(application.getAplyDt());
        dto.setAplyStatCd(application.getAplyStatCd());
        dto.setAplyStatNm(NoncurApplicationConstants.getStatusName(application.getAplyStatCd()));
        return dto;
    }
    
    
    
    /**
     * Entity to DetailDTO 변환 (프로그램 정보 포함)
     */
    private NoncurApplicationDTO convertToDetailDTO(NoncurApplication application) {
        NoncurApplicationDTO dto = new NoncurApplicationDTO();
        dto.setAplyId(application.getAplyId());
        dto.setPrgId(application.getPrgId());
        dto.setStdNo(application.getStdNo());
        dto.setAplySelCd(application.getAplySelCd());
        dto.setAplyDt(application.getAplyDt());
        dto.setAplyStatCd(application.getAplyStatCd());
        dto.setAplyStatNm(NoncurApplicationConstants.getStatusName(application.getAplyStatCd()));

        return dto;
    }
}