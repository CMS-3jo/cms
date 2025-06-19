package kr.co.cms.domain.noncur.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import kr.co.cms.domain.noncur.dto.NoncurSearchDTO;
import kr.co.cms.domain.noncur.dto.NoncurDetailDTO;
import kr.co.cms.domain.noncur.dto.NoncurApplicationRequestDTO;
import kr.co.cms.domain.noncur.dto.NoncurApplicationDTO;
import kr.co.cms.domain.noncur.dto.NoncurRegisterDTO;
import kr.co.cms.domain.noncur.service.NoncurService;
import kr.co.cms.global.util.JwtUtil;
import kr.co.cms.global.util.TokenUtil;
import kr.co.cms.domain.noncur.service.NoncurApplicationService;
import kr.co.cms.domain.noncur.service.NoncurRegisterService;
import kr.co.cms.domain.dept.service.DeptInfoService;
import kr.co.cms.domain.mileage.dto.StudentMileageDTO;
import kr.co.cms.domain.mileage.service.MileageService;
import kr.co.cms.domain.dept.dto.DeptInfoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 비교과 프로그램 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/noncur")
@RequiredArgsConstructor
public class NoncurController {

    private final NoncurService service;
    private final NoncurApplicationService applicationService;
    private final NoncurRegisterService registerService;
    private final JwtUtil jwtUtil;
    private final TokenUtil tokenUtil;
    private final DeptInfoService deptInfoService;
    
    /**
     * 비교과 프로그램 목록 조회 (검색/필터 포함)
     */
    @GetMapping
    @ResponseBody  
    public ResponseEntity<Map<String, Object>> noncurList(@ModelAttribute NoncurSearchDTO searchDTO){
        try {
            Map<String, Object> response = service.getNoncurProgramsWithPagination(searchDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 비교과 프로그램 상세 정보 조회
     */
    @GetMapping("/{prgId}")
    @ResponseBody
    public ResponseEntity<NoncurDetailDTO> getNoncurDetail(@PathVariable("prgId") String prgId) {
        try {
            NoncurDetailDTO detail = service.getNoncurDetail(prgId);
            if (detail == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(detail);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 핵심역량 목록 조회
     */
    @GetMapping("/competencies")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAllCompetencies() {
        try {
            Map<String, Object> competencies = service.getAllCompetencies();
            return ResponseEntity.ok(competencies);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 부서 목록 조회 (기존 부서 서비스 활용)
     */
    @GetMapping("/departments")
    @ResponseBody
    public ResponseEntity<List<DeptInfoDto>> getAllDepartments() {
        try {
            // 기존 DeptInfoService 활용
            List<DeptInfoDto> departments = deptInfoService.getAll();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 프로그램 수정용 데이터 조회
     */
    @GetMapping("/{prgId}/edit")
    @ResponseBody
    public ResponseEntity<NoncurRegisterDTO> getProgramForEdit(@PathVariable("prgId") String prgId) {
        try {
            NoncurRegisterDTO program = registerService.getProgramForEdit(prgId);
            return ResponseEntity.ok(program);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 새로운 비교과 프로그램 등록
     */
    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<?> registerProgram(@Valid @RequestBody NoncurRegisterDTO registerDTO) {
        try {
            String prgId = registerService.registerProgram(registerDTO);
            return ResponseEntity.ok(Map.of(
                "message", "프로그램이 성공적으로 등록되었습니다.",
                "prgId", prgId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "프로그램 등록 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
    
    /**
     * 기존 비교과 프로그램 정보 수정
     */
    @PutMapping("/{prgId}")
    @ResponseBody
    public ResponseEntity<?> updateProgram(
            @PathVariable("prgId") String prgId,
            @Valid @RequestBody NoncurRegisterDTO updateDTO) {
        try {
            registerService.updateProgram(prgId, updateDTO);
            return ResponseEntity.ok(Map.of("message", "프로그램이 성공적으로 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "프로그램 수정 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 비교과 프로그램 삭제
     */
    @DeleteMapping("/{prgId}")
    @ResponseBody
    public ResponseEntity<?> deleteProgram(@PathVariable("prgId") String prgId) {
        try {
            registerService.deleteProgram(prgId);
            return ResponseEntity.ok(Map.of("message", "프로그램이 성공적으로 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "프로그램 삭제 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 프로그램과 핵심역량 매핑 추가
     */
    @PostMapping("/competency-mapping")
    @ResponseBody
    public ResponseEntity<?> addCompetencyMapping(@RequestBody Map<String, String> request) {
        try {
            String prgId = request.get("prgId");
            String cciId = request.get("cciId");
            
            if (prgId == null || cciId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "prgId와 cciId는 필수입니다."));
            }
            
            // 핵심역량 매핑 추가 로직
            
            return ResponseEntity.ok(Map.of("message", "핵심역량 매핑이 추가되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "핵심역량 매핑 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 학생이 비교과 프로그램에 신청
     */
    @PostMapping("/{prgId}/apply")
    @ResponseBody
    public ResponseEntity<?> applyProgram(
            @PathVariable("prgId") String prgId,
            @Valid @RequestBody NoncurApplicationRequestDTO requestDTO,
            HttpServletRequest request) {
        try {
            // 토큰에서 학번 추출
            String stdNo = tokenUtil.getIdentifierNoFromRequest(request);
            
            NoncurApplicationDTO result = applicationService.applyProgram(prgId, stdNo, requestDTO);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "신청 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 학생이 비교과 프로그램 신청 취소
     */
    @DeleteMapping("/{prgId}/apply/{stdNo}")
    @ResponseBody
    public ResponseEntity<?> cancelApplication(
            @PathVariable("prgId") String prgId,
            @PathVariable("stdNo") String stdNo) {
        try {
            applicationService.cancelApplication(prgId, stdNo);
            return ResponseEntity.ok(Map.of("message", "신청이 취소되었습니다."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "취소 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 특정 프로그램의 현재 신청자 수 조회
     */
    @GetMapping("/{prgId}/applicant-count")
    @ResponseBody
    public ResponseEntity<Map<String, Long>> getApplicantCount(@PathVariable("prgId") String prgId) {
        try {
            Long count = applicationService.getCurrentApplicantCount(prgId);
            return ResponseEntity.ok(Map.of("currentApplicants", count));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 학생의 모든 신청 내역 조회
     */
    @GetMapping("/applications/{stdNo}")
    @ResponseBody
    public ResponseEntity<List<NoncurApplicationDTO>> getStudentApplications(@PathVariable("stdNo") String stdNo) {
        try {
            List<NoncurApplicationDTO> applications = applicationService.getStudentApplications(stdNo);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    

    /**
     * 학생의 이수완료 내역 조회
     */
    @GetMapping("/completion/student/{stdNo}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStudentCompletions(@PathVariable("stdNo") String stdNo) {
        try {
            List<NoncurApplicationDTO> completedApplications = applicationService.getStudentCompletedApplications(stdNo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("completedPrograms", completedApplications);
            response.put("totalCompleted", completedApplications.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "이수완료 내역 조회 중 오류가 발생했습니다."));
        }
    }

 // NoncurController에 추가할 메서드들 (마일리지 API 제거)

    /**
     * 내 신청 내역 조회 (토큰에서 자동으로 학번 추출)
     */
    @GetMapping("/applications/my")
    @ResponseBody
    public ResponseEntity<List<NoncurApplicationDTO>> getMyApplications(HttpServletRequest request) {
        try {
            // TokenUtil을 사용하여 학번 추출
            String stdNo = tokenUtil.getIdentifierNoFromRequest(request);
            
            List<NoncurApplicationDTO> applications = applicationService.getStudentApplications(stdNo);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 내 이수완료 내역 조회 (토큰에서 자동으로 학번 추출)
     */
    @GetMapping("/completion/my")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMyCompletions(HttpServletRequest request) {
        try {
            // TokenUtil을 사용하여 학번 추출
            String stdNo = tokenUtil.getIdentifierNoFromRequest(request);
            
            List<NoncurApplicationDTO> completedApplications = applicationService.getStudentCompletedApplications(stdNo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("completedPrograms", completedApplications);
            response.put("totalCompleted", completedApplications.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "이수완료 내역 조회 중 오류가 발생했습니다."));
        }
    } 
}