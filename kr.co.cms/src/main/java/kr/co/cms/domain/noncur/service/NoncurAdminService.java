package kr.co.cms.domain.noncur.service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import kr.co.cms.domain.noncur.dto.*;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.entity.NcsCompletionInfo; // 추가
import kr.co.cms.domain.noncur.repository.NcsCompletionInfoRepository;
import kr.co.cms.domain.noncur.repository.NoncurApplicationRepository;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.global.util.IdGenerator;
import kr.co.cms.domain.noncur.constants.NoncurApplicationConstants;
import kr.co.cms.domain.noncur.constants.NoncurConstants;
import kr.co.cms.domain.dept.dto.DeptInfoDto;
import kr.co.cms.domain.dept.service.DeptInfoService;
import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.service.MileageService;
import kr.co.cms.domain.mypage.repository.EmplInfoRepository;
import kr.co.cms.domain.mypage.entity.EmplInfo;

@Service
@Transactional(readOnly = true)
public class NoncurAdminService {

    private final NoncurApplicationRepository applicationRepository;
    private final NoncurRepository programRepository;
    private final NoncurApplicationService applicationService;
    private final SimplePermissionService permissionService;
    private final EmplInfoRepository emplInfoRepository;
    private final DeptInfoService deptInfoService;
    private final NcsCompletionInfoRepository completionInfoRepository;
    private final MileageService mileageService;
    private final NoncurCodeService noncurCodeService; // 공통코드 서비스 추가

    
    public NoncurAdminService(NoncurApplicationRepository applicationRepository,
                             NoncurRepository programRepository,
                             NoncurApplicationService applicationService,
                             SimplePermissionService permissionService,
                             EmplInfoRepository emplInfoRepository,
                             DeptInfoService deptInfoService,
                             NcsCompletionInfoRepository completionInfoRepository,
                             MileageService mileageService,
                             NoncurCodeService noncurCodeService) {

        this.applicationRepository = applicationRepository;
        this.programRepository = programRepository;
        this.applicationService = applicationService;
        this.permissionService = permissionService;
        this.emplInfoRepository = emplInfoRepository;
        this.deptInfoService = deptInfoService;
        this.completionInfoRepository = completionInfoRepository;
        this.mileageService = mileageService;
        this.noncurCodeService = noncurCodeService;

    }
    
    /**
     * 프로그램별 신청자 목록 조회
     */
    public Map<String, Object> getProgramApplications(String prgId, int page, int size, String statusCd) {
        Sort sort = Sort.by(Sort.Direction.DESC, "aplyDt");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<NoncurApplication> applications;
        if (statusCd != null && !statusCd.isEmpty()) {
            applications = applicationRepository.findByPrgIdAndAplyStatCdOrderByAplyDtDesc(prgId, statusCd);
        } else {
            applications = applicationRepository.findByPrgIdOrderByAplyDtDesc(prgId);
        }
        
        // 페이징 처리 (수동)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), applications.size());
        List<NoncurApplication> pageContent = applications.subList(start, end);
        
        // DTO 변환
        List<NoncurApplicationDetailDTO> applicationDTOs = pageContent.stream()
            .map(this::convertToDetailDTO)
            .collect(Collectors.toList());
        
        // 통계 정보
        Map<String, Long> statusStats = applications.stream()
            .collect(Collectors.groupingBy(NoncurApplication::getAplyStatCd, Collectors.counting()));
        
        Map<String, Object> response = new HashMap<>();
        response.put("applications", applicationDTOs);
        response.put("totalElements", applications.size());
        response.put("totalPages", (int) Math.ceil((double) applications.size() / size));
        response.put("currentPage", page);
        response.put("size", size);
        response.put("statusStats", statusStats);
        
        return response;
    }
    
    /**
     * 신청 상태 변경
     */
    @Transactional
    public void updateApplicationStatus(String aplyId, String statusCd, String rejectReason, String userId) {
        NoncurApplication application = applicationRepository.findById(aplyId)
            .orElseThrow(() -> new IllegalArgumentException("신청 정보를 찾을 수 없습니다."));
        
        // 상태 변경 가능 여부 확인
        validateStatusChange(application.getAplyStatCd(), statusCd);
        
        // 상태 변경
        application.setAplyStatCd(statusCd);
        applicationRepository.save(application);
    }
    
    /**
     * 일괄 상태 변경
     */
    @Transactional
    public int batchUpdateStatus(List<String> aplyIds, String statusCd, String userId) {
        int updatedCount = 0;
        
        for (String aplyId : aplyIds) {
            try {
                updateApplicationStatus(aplyId, statusCd, null, userId);
                updatedCount++;
            } catch (Exception e) {
                System.err.println("Failed to update application " + aplyId + ": " + e.getMessage());
            }
        }
        
        return updatedCount;
    }
    
    /**
     * 프로그램 상태 변경
     */
    @Transactional
    public void updateProgramStatus(String prgId, String statusCd, String userId) {
        NoncurProgram program = programRepository.findById(prgId)
            .orElseThrow(() -> new IllegalArgumentException("프로그램을 찾을 수 없습니다."));
        
        program.setPrgStatCd(statusCd);
        program.setUpdUserId(userId);
        programRepository.save(program);
    }
    
    /**
     * 이수완료 처리 (마일리지 부여 정보 반환) - IdGenerator 사용
     */
    @Transactional
    public MileageAwardRequestDTO completeApplicationWithMileage(String aplyId, String userId) {
        NoncurApplication application = applicationRepository.findById(aplyId)
            .orElseThrow(() -> new IllegalArgumentException("신청 정보를 찾을 수 없습니다."));
        
        // 승인 상태인지 확인
        if (!NoncurApplicationConstants.ApplicationStatus.APPROVED.equals(application.getAplyStatCd())) {
            String errorMsg = String.format(
                "승인된 신청만 이수완료 처리할 수 있습니다. 현재 상태: %s (%s)", 
                application.getAplyStatCd(),
                NoncurApplicationConstants.getStatusName(application.getAplyStatCd())
            );
            throw new IllegalStateException(errorMsg);
        }
        
        // 이미 이수완료인지 확인
        if (NoncurApplicationConstants.ApplicationStatus.COMPLETED.equals(application.getAplyStatCd())) {
            throw new IllegalStateException("이미 이수완료 처리된 신청입니다.");
        }
        
        // 중복 이수완료 체크
        if (completionInfoRepository.existsByAplyId(aplyId)) {
            throw new IllegalStateException("이미 이수완료 정보가 등록된 신청입니다.");
        }
        
        // 1. 이수완료 정보 생성 (NCS_CMP_INFO) - IdGenerator 사용
        String cmpId = IdGenerator.generate("CMP", completionInfoRepository);
        System.out.println("생성된 이수완료 ID: " + cmpId);
        
        NcsCompletionInfo completionInfo = new NcsCompletionInfo(
            cmpId,
            aplyId,
            application.getPrgId(),
            application.getStdNo()
        );
        completionInfoRepository.save(completionInfo);
        System.out.println("이수완료 정보 DB 저장 완료: " + cmpId);
        
        // 2. 신청 상태를 이수완료로 변경
        application.setAplyStatCd(NoncurApplicationConstants.ApplicationStatus.COMPLETED);
        applicationRepository.save(application);
        System.out.println("신청 상태 변경 완료: " + aplyId);
        
        // 3. 마일리지 부여 정보 생성
        MileageAwardRequestDTO mileageRequest = new MileageAwardRequestDTO();
        mileageRequest.setPrgId(application.getPrgId());
        mileageRequest.setStdNo(application.getStdNo());
        mileageRequest.setCmpId(cmpId); // 생성된 이수완료 ID 사용
        mileageRequest.setRegUserId(userId);
        
        return mileageRequest;
    }
    
    /**
     * 일괄 이수완료 처리
     */
    @Transactional
    public Map<String, Object> batchCompleteApplications(List<String> aplyIds, String userId) {
        Map<String, Object> result = new HashMap<>();
        List<MileageAwardRequestDTO> successfulCompletions = new ArrayList<>();
        List<String> failedApplications = new ArrayList<>();
        int mileageAwardCount = 0;

        for (String aplyId : aplyIds) {
            try {
                // 이수완료 처리
                MileageAwardRequestDTO mileageRequest = completeApplicationWithMileage(aplyId, userId);
                successfulCompletions.add(mileageRequest);
                
                // 마일리지 부여 시도
                try {
                    mileageService.awardMileage(mileageRequest);
                    mileageAwardCount++;
                    System.out.println("마일리지 부여 완료: " + aplyId + " -> " + mileageRequest.getStdNo());
                } catch (Exception mileageError) {
                    System.err.println("마일리지 부여 실패 (신청 ID: " + aplyId + "): " + mileageError.getMessage());
                    // 마일리지 부여는 실패해도 이수완료 처리는 유지
                }
                
            } catch (Exception e) {
                failedApplications.add(aplyId);
                System.err.println("이수완료 처리 실패 (신청 ID: " + aplyId + "): " + e.getMessage());
            }
        }
        
        result.put("successCount", successfulCompletions.size());
        result.put("failedCount", failedApplications.size());
        result.put("mileageAwardCount", mileageAwardCount);
        result.put("successfulCompletions", successfulCompletions);
        result.put("failedApplications", failedApplications);
        
        return result;
    }
    
    /**
     * 부서별 프로그램 목록 조회
     */
    public Map<String, Object> getDepartmentPrograms(String deptCd, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "regDt");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NoncurProgram> programPage = programRepository.findBySearchConditions(
            null, deptCd, null, pageable
        );
        
        List<NoncurDTO> programs = programPage.getContent().stream()
            .map(this::convertProgramToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("programs", programs);
        response.put("totalElements", programPage.getTotalElements());
        response.put("totalPages", programPage.getTotalPages());
        response.put("currentPage", programPage.getNumber());
        response.put("size", programPage.getSize());
        
        return response;
    }
    
    /**
     * 통계 조회
     */
    public Map<String, Object> getStatistics(String userId, String deptCd) {
        Map<String, Object> statistics = new HashMap<>();
        
        // 전체 프로그램 수
        long totalPrograms = programRepository.count();
        statistics.put("totalPrograms", totalPrograms);
        
        // 프로그램 상태별 통계
        List<NoncurProgram> allPrograms = deptCd != null 
            ? programRepository.findByPrgDeptCd(deptCd)
            : programRepository.findAll();
            
        Map<String, Long> programsByStatus = allPrograms.stream()
            .collect(Collectors.groupingBy(NoncurProgram::getPrgStatCd, Collectors.counting()));
        statistics.put("programsByStatus", programsByStatus);
        
        // 전체 신청 수
        long totalApplications = applicationRepository.count();
        statistics.put("totalApplications", totalApplications);
        
        // 신청 상태별 통계
        List<NoncurApplication> allApplications = applicationRepository.findAll();
        Map<String, Long> applicationsByStatus = allApplications.stream()
            .collect(Collectors.groupingBy(NoncurApplication::getAplyStatCd, Collectors.counting()));
        statistics.put("applicationsByStatus", applicationsByStatus);
        
        return statistics;
    }
    
    // ======= 권한 관련 메서드들 =======
    
    /**
     * 프로그램 관리 권한 확인
     */
    public boolean hasPermission(String userId, String prgId) {
        return permissionService.hasPermissionForProgram(userId, prgId);
    }
    
    /**
     * 신청 관리 권한 확인
     */
    public boolean hasApplicationPermission(String userId, String aplyId) {
        NoncurApplication application = applicationRepository.findById(aplyId).orElse(null);
        if (application == null) return false;
        
        return permissionService.hasPermissionForProgram(userId, application.getPrgId());
    }
    
    /**
     * 부서 권한 확인
     */
    public boolean hasDepartmentPermission(String userId, String deptCd) {
        return permissionService.hasPermissionForDepartment(userId, deptCd);
    }
    
    /**
     * 사용자 부서 조회
     */
    public String getUserDepartment(String userId) {
        return permissionService.getUserDepartment(userId);
    }
    
    /**
     * 프로그램 존재 여부 확인
     */
    public boolean programExists(String prgId) {
        return programRepository.existsById(prgId);
    }
    
    /**
     * 신청 정보 조회
     */
    public NoncurApplication getApplicationById(String aplyId) {
        return applicationRepository.findById(aplyId).orElse(null);
    }
    
    // ======= 유틸리티 메서드들 =======
    
    /**
     * 상태 변경 검증
     */
    private void validateStatusChange(String currentStatus, String newStatus) {
        // 이미 완료된 상태는 변경 불가
        if (NoncurApplicationConstants.ApplicationStatus.COMPLETED.equals(currentStatus)) {
            throw new IllegalStateException("이수완료된 신청은 상태를 변경할 수 없습니다.");
        }
        
        // 취소된 상태는 변경 불가
        if (NoncurApplicationConstants.ApplicationStatus.CANCELLED.equals(currentStatus)) {
            throw new IllegalStateException("취소된 신청은 상태를 변경할 수 없습니다.");
        }
        
        // 이수완료는 승인 상태에서만 가능
        if (NoncurApplicationConstants.ApplicationStatus.COMPLETED.equals(newStatus) &&
            !NoncurApplicationConstants.ApplicationStatus.APPROVED.equals(currentStatus)) {
            throw new IllegalStateException("승인된 신청만 이수완료 처리할 수 있습니다.");
        }
    }
    
    /**
     * Entity to DetailDTO 변환
     */
    private NoncurApplicationDetailDTO convertToDetailDTO(NoncurApplication application) {
        NoncurApplicationDetailDTO dto = new NoncurApplicationDetailDTO();
        dto.setAplyId(application.getAplyId());
        dto.setPrgId(application.getPrgId());
        dto.setStdNo(application.getStdNo());
        dto.setAplySelCd(application.getAplySelCd());
        dto.setAplyDt(application.getAplyDt());
        dto.setAplyStatCd(application.getAplyStatCd());
        dto.setAplyStatNm(NoncurApplicationConstants.getStatusName(application.getAplyStatCd()));
        dto.setAplySelNm(NoncurApplicationConstants.getTypeName(application.getAplySelCd()));
        
        return dto;
    }
    
    /**
     * Program Entity to DTO 변환
     */
    private NoncurDTO convertProgramToDTO(NoncurProgram program) {
        NoncurDTO dto = new NoncurDTO();
        dto.setPrgId(program.getPrgId());
        dto.setPrgNm(program.getPrgNm());
        dto.setPrgDesc(program.getPrgDesc());
        dto.setPrgStDt(program.getPrgStDt());
        dto.setPrgEndDt(program.getPrgEndDt());
        dto.setPrgDeptCd(program.getPrgDeptCd());
        dto.setMaxCnt(program.getMaxCnt());
        dto.setRegUserId(program.getRegUserId());
        dto.setRegDt(program.getRegDt());
        dto.setUpdDt(program.getUpdDt());
        dto.setPrgStatCd(program.getPrgStatCd());
        dto.setPrgStatNm(noncurCodeService.getProgramStatusName(program.getPrgStatCd()));

        
        // 부서명 조회
        try {
            List<DeptInfoDto> allDepts = deptInfoService.getAll();
            String deptName = allDepts.stream()
                .filter(dept -> dept.getDeptCd().equals(program.getPrgDeptCd()))
                .map(DeptInfoDto::getDeptNm)
                .findFirst()
                .orElse("알 수 없는 부서");
            dto.setDeptName(deptName);
        } catch (Exception e) {
            dto.setDeptName("알 수 없는 부서");
        }
        
        return dto;
    }
}