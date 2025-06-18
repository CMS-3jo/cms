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
import kr.co.cms.domain.noncur.repository.NoncurApplicationRepository;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.domain.noncur.constants.NoncurApplicationConstants;
import kr.co.cms.domain.noncur.constants.NoncurConstants;
import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.service.MileageService;

@Service
@Transactional(readOnly = true)
public class NoncurAdminService {
    
    private final NoncurApplicationRepository applicationRepository;
    private final NoncurRepository programRepository;
    private final NoncurApplicationService applicationService;
    
    public NoncurAdminService(NoncurApplicationRepository applicationRepository,
                             NoncurRepository programRepository,
                             NoncurApplicationService applicationService) {
        this.applicationRepository = applicationRepository;
        this.programRepository = programRepository;
        this.applicationService = applicationService;
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
        
        // 거부 사유 저장 (별도 컬럼이 있다면)
        // application.setRejectReason(rejectReason);
        
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
                // 개별 실패는 무시하고 계속 진행
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
     * 이수완료 처리 (마일리지 부여 정보 반환)
     */
    @Transactional
    public MileageAwardRequestDTO completeApplicationWithMileage(String aplyId, String userId) {
        NoncurApplication application = applicationRepository.findById(aplyId)
            .orElseThrow(() -> new IllegalArgumentException("신청 정보를 찾을 수 없습니다."));
        
        // 승인 상태인지 확인
        if (!NoncurApplicationConstants.ApplicationStatus.APPROVED.equals(application.getAplyStatCd())) {
            throw new IllegalStateException("승인된 신청만 이수완료 처리할 수 있습니다.");
        }
        
        // 이수완료로 상태 변경
        application.setAplyStatCd(NoncurApplicationConstants.ApplicationStatus.COMPLETED);
        applicationRepository.save(application);
        
        // 마일리지 부여 정보 생성
        MileageAwardRequestDTO mileageRequest = new MileageAwardRequestDTO();
        mileageRequest.setPrgId(application.getPrgId());
        mileageRequest.setStdNo(application.getStdNo());
        mileageRequest.setCmpId(generateCompletionId()); // 이수 ID 생성
        
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
        
        for (String aplyId : aplyIds) {
            try {
                MileageAwardRequestDTO mileageRequest = completeApplicationWithMileage(aplyId, userId);
                successfulCompletions.add(mileageRequest);
            } catch (Exception e) {
                failedApplications.add(aplyId);
                System.err.println("Failed to complete application " + aplyId + ": " + e.getMessage());
            }
        }
        
        result.put("successCount", successfulCompletions.size());
        result.put("failedCount", failedApplications.size());
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
        
        // 부서별 통계
        Map<String, Map<String, Object>> departmentStats = new HashMap<>();
        List<Map<String, String>> departments = getAllDepartments();
        
        for (Map<String, String> dept : departments) {
            String deptCode = dept.get("deptCd");
            String deptName = dept.get("deptNm");
            
            Map<String, Object> deptStat = new HashMap<>();
            long programCount = allPrograms.stream()
                .filter(p -> deptCode.equals(p.getPrgDeptCd()))
                .count();
            
            long applicationCount = 0;
            long completedCount = 0;
            
            // 해당 부서 프로그램들의 신청 수 계산
            List<String> deptProgramIds = allPrograms.stream()
                .filter(p -> deptCode.equals(p.getPrgDeptCd()))
                .map(NoncurProgram::getPrgId)
                .collect(Collectors.toList());
            
            for (String prgId : deptProgramIds) {
                List<NoncurApplication> prgApplications = applicationRepository.findByPrgId(prgId);
                applicationCount += prgApplications.size();
                completedCount += prgApplications.stream()
                    .filter(a -> NoncurApplicationConstants.ApplicationStatus.COMPLETED.equals(a.getAplyStatCd()))
                    .count();
            }
            
            deptStat.put("programCount", programCount);
            deptStat.put("applicationCount", applicationCount);
            deptStat.put("completedCount", completedCount);
            
            departmentStats.put(deptName, deptStat);
        }
        
        statistics.put("departmentStats", departmentStats);
        
        return statistics;
    }
    
    /**
     * 권한 확인 - 프로그램 관리 권한
     */
    public boolean hasPermission(String userId, String prgId) {
        // TODO: 실제 권한 체크 로직 구현
        // 1. 시스템 관리자인지 확인
        // 2. 해당 프로그램의 부서 관리자인지 확인
        // 3. 프로그램 담당자인지 확인
        return true; // 임시로 모든 권한 허용
    }
    
    /**
     * 권한 확인 - 신청 관리 권한
     */
    public boolean hasApplicationPermission(String userId, String aplyId) {
        // 신청 정보로부터 프로그램 ID를 가져와서 권한 확인
        NoncurApplication application = applicationRepository.findById(aplyId).orElse(null);
        if (application == null) return false;
        
        return hasPermission(userId, application.getPrgId());
    }
    
    /**
     * 권한 확인 - 부서 권한
     */
    public boolean hasDepartmentPermission(String userId, String deptCd) {
        // TODO: 실제 부서 권한 체크 로직 구현
        return true; // 임시
    }
    
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
     * 이수 ID 생성
     */
    private String generateCompletionId() {
        return "CMP" + System.currentTimeMillis();
    }
    
    /**
     * 부서 목록 조회 (임시)
     */
    private List<Map<String, String>> getAllDepartments() {
        List<Map<String, String>> departments = new ArrayList<>();
        departments.add(Map.of("deptCd", "DEPT001", "deptNm", "학생지원팀"));
        departments.add(Map.of("deptCd", "DEPT002", "deptNm", "교무팀"));
        departments.add(Map.of("deptCd", "DEPT003", "deptNm", "취업지원센터"));
        departments.add(Map.of("deptCd", "DEPT004", "deptNm", "SW교육센터"));
        return departments;
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
        
        // TODO: 학생 정보, 프로그램 정보 조인 조회
        // dto.setStdNm(studentName);
        // dto.setPrgNm(programName);
        
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
        dto.setPrgStatNm(NoncurConstants.getStatusName(program.getPrgStatCd()));
        
        // 부서명 조회
        String deptName = programRepository.findDeptNameByCode(program.getPrgDeptCd());
        dto.setDeptName(deptName);
        
        return dto;
    }
}