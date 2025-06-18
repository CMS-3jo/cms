package kr.co.cms.domain.noncur.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.cca.dto.CoreCptInfoDto;
import kr.co.cms.domain.cca.service.CoreCptInfoService;
import kr.co.cms.domain.noncur.constants.NoncurConstants;
import kr.co.cms.domain.noncur.dto.NoncurDTO;
import kr.co.cms.domain.noncur.dto.NoncurDetailDTO;
import kr.co.cms.domain.noncur.dto.NoncurSearchDTO;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.repository.NoncurMapRepository;
import kr.co.cms.domain.noncur.repository.NoncurRepository;

@Service
@Transactional(readOnly = true)
public class NoncurService {
    
    private final NoncurRepository noncurRepository;
    private final NoncurMapRepository noncurMapRepository;
    private final CoreCptInfoService coreCptInfoService;
    private final NoncurApplicationService applicationService; // 신청자 수 조회용

    public NoncurService(NoncurRepository noncurRepository, 
                        NoncurMapRepository noncurMapRepository,
                        CoreCptInfoService coreCptInfoService,
                        NoncurApplicationService applicationService) { 
        this.noncurRepository = noncurRepository;
        this.noncurMapRepository = noncurMapRepository;
        this.coreCptInfoService = coreCptInfoService;
        this.applicationService = applicationService;           
    }
    
    /**
     * 실제 DB에서 모든 부서 목록 조회
     */
    public List<Map<String, String>> getAllDepartments() {
        try {
            // Repository의 네이티브 쿼리 사용
            List<Object[]> results = noncurRepository.findAllDepartmentsNative();
            
            return results.stream()
                .map(row -> {
                    Map<String, String> dept = new HashMap<>();
                    dept.put("deptCd", String.valueOf(row[0]));
                    dept.put("deptNm", String.valueOf(row[1]));
                    return dept;
                })
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.err.println("부서 목록 조회 실패: " + e.getMessage());
            e.printStackTrace();
            
            // DB 조회 실패 시 기본 부서 목록 반환
            List<Map<String, String>> defaultDepts = new ArrayList<>();
            defaultDepts.add(createDeptMap("DEPT001", "학생지원팀"));
            defaultDepts.add(createDeptMap("DEPT002", "교무팀"));
            defaultDepts.add(createDeptMap("DEPT003", "취업지원센터"));
            defaultDepts.add(createDeptMap("DEPT004", "SW교육센터"));
            return defaultDepts;
        }
    }

    private Map<String, String> createDeptMap(String deptCd, String deptNm) {
        Map<String, String> dept = new HashMap<>();
        dept.put("deptCd", deptCd);
        dept.put("deptNm", deptNm);
        return dept;
    }
    
    public Map<String, Object> getNoncurProgramsWithPagination(NoncurSearchDTO searchDTO) {
        Sort sort = Sort.by(Sort.Direction.fromString(searchDTO.getSortDir()), searchDTO.getSortBy());
        Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);
        
        Page<NoncurProgram> programPage;
        if (hasSearchConditions(searchDTO)) {
            programPage = noncurRepository.findBySearchConditions(
                searchDTO.getKeyword(),
                searchDTO.getSearchDeptCode(),
                searchDTO.getSearchStatusCode(),
                pageable
            );
        } else {
            programPage = noncurRepository.findAllByOrderByRegDtDesc(pageable);
        }
        
        List<NoncurDTO> programs = programPage.getContent().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("programs", programs);
        response.put("totalElements", programPage.getTotalElements());
        response.put("totalPages", programPage.getTotalPages());
        response.put("currentPage", programPage.getNumber());
        response.put("size", programPage.getSize());
        response.put("hasNext", programPage.hasNext());
        response.put("hasPrevious", programPage.hasPrevious());
        response.put("isFirst", programPage.isFirst());
        response.put("isLast", programPage.isLast());
        
        return response;
    }

    public NoncurDetailDTO getNoncurDetail(String prgId) {
        NoncurProgram program = noncurRepository.findById(prgId).orElse(null);
        if (program == null) {
            return null;
        }
        
        NoncurDetailDTO detail = new NoncurDetailDTO();
        detail.setPrgId(program.getPrgId());
        detail.setPrgNm(program.getPrgNm());
        detail.setPrgDesc(program.getPrgDesc());
        detail.setPrgStDt(program.getPrgStDt());
        detail.setPrgEndDt(program.getPrgEndDt());
        detail.setPrgDeptCd(program.getPrgDeptCd());
        detail.setMaxCnt(program.getMaxCnt());
        detail.setRegUserId(program.getRegUserId());
        detail.setRegDt(program.getRegDt());
        detail.setUpdDt(program.getUpdDt());
        detail.setPrgStatCd(program.getPrgStatCd());
        detail.setPrgStatNm(NoncurConstants.getStatusName(program.getPrgStatCd()));
        
        // D-day 계산
        if (program.getPrgStDt() != null) {
            long dDay = ChronoUnit.DAYS.between(LocalDateTime.now(), program.getPrgStDt());
            detail.setDDay(dDay);
        }
        
        // 부서명 조회
        String deptName = noncurRepository.findDeptNameByCode(program.getPrgDeptCd());
        detail.setDeptName(deptName);
        
        // 마일리지는 별도 API(/api/mileage/program/{prgId})로 조회
        
        // 핵심역량 정보 설정 (실제 DB 연동)
        setupCompetencies(detail, prgId);
        
        // 추가 정보 설정 (실제 DB 컬럼에서)
        detail.setLocation(program.getPrgLocation());
        detail.setContactEmail(program.getPrgContactEmail());
        detail.setContactPhone(program.getPrgContactPhone());
        detail.setTargetInfo(program.getPrgTargetInfo());
        detail.setDepartmentInfo(program.getPrgDeptInfo());
        detail.setGradeInfo(program.getPrgGradeInfo());
        detail.setProgramSchedule(program.getPrgSchedule());
        
        // 현재 신청자 수 (실제 계산)
        try {
            long currentApplicants = applicationService.getCurrentApplicantCount(prgId);
            detail.setCurrentApplicants((int) currentApplicants);
        } catch (Exception e) {
            detail.setCurrentApplicants(0);
        }
        
        // 첨부파일은 구현되지 않았으면 빈 리스트
        detail.setAttachments(new ArrayList<>());
        
        return detail;
    }
    
    public Map<String, Object> getAllCompetencies() {
        try {
            List<CoreCptInfoDto> competencies = coreCptInfoService.getAll();
            Map<String, Object> response = new HashMap<>();
            response.put("competencies", competencies);
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("competencies", new ArrayList<>());
            return response;
        }
    }
    
    /**
     * 핵심역량 설정 (실제 DB 연동)
     */
    private void setupCompetencies(NoncurDetailDTO detail, String prgId) {
        try {
            // 실제 DB에서 모든 핵심역량 조회
            List<CoreCptInfoDto> allCoreCompetencies = coreCptInfoService.getAll();
            
            // 실제 DB에서 매핑된 핵심역량 ID들 조회
            List<String> programCompetencyIds = noncurMapRepository.findCompetencyIdsByProgramId(prgId);
            
            // DTO 변환
            List<NoncurDetailDTO.CompetencyDTO> allCompetencies = allCoreCompetencies.stream()
                .map(this::convertToCompetencyDTO)
                .collect(Collectors.toList());
            
            // 선택 상태 설정
            allCompetencies.forEach(comp -> 
                comp.setSelected(programCompetencyIds.contains(comp.getCciId()))
            );
            
            List<NoncurDetailDTO.CompetencyDTO> selectedCompetencies = allCompetencies.stream()
                .filter(NoncurDetailDTO.CompetencyDTO::isSelected)
                .collect(Collectors.toList());
            
            detail.setCompetencies(selectedCompetencies);
            detail.setAllCompetencies(allCompetencies);
            
        } catch (Exception e) {
            // 오류 시 빈 리스트로 처리
            detail.setCompetencies(new ArrayList<>());
            detail.setAllCompetencies(new ArrayList<>());
        }
    }
    
    /**
     * CoreCptInfoDto를 CompetencyDTO로 변환
     */
    private NoncurDetailDTO.CompetencyDTO convertToCompetencyDTO(CoreCptInfoDto coreDto) {
        NoncurDetailDTO.CompetencyDTO dto = new NoncurDetailDTO.CompetencyDTO();
        dto.setCciId(coreDto.getCciId());
        dto.setCciNm(coreDto.getCciNm());
        dto.setCciDesc(coreDto.getCciDesc());
        dto.setSelected(false);
        return dto;
    }
    
    private NoncurDTO convertToDTO(NoncurProgram program) {
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
        
        if (program.getPrgStDt() != null) {
            long dDay = ChronoUnit.DAYS.between(LocalDateTime.now(), program.getPrgStDt());
            dto.setDDay(dDay);
        }
        
        String deptName = noncurRepository.findDeptNameByCode(program.getPrgDeptCd());
        dto.setDeptName(deptName);
        
        List<String> competencyIds = noncurMapRepository.findCompetencyIdsByProgramId(program.getPrgId());
        dto.setCciIds(competencyIds);
        
        // 마일리지는 별도 API로 조회
        
        return dto;
    }
    
    private boolean hasSearchConditions(NoncurSearchDTO searchDTO) {
        return (searchDTO.getKeyword() != null && !searchDTO.getKeyword().trim().isEmpty()) ||
               (searchDTO.getSearchDeptCode() != null && !searchDTO.getSearchDeptCode().trim().isEmpty()) ||
               (searchDTO.getSearchStatusCode() != null && !searchDTO.getSearchStatusCode().trim().isEmpty());
    }
}