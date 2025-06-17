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
import kr.co.cms.domain.noncur.service.NoncurApplicationService;
import kr.co.cms.domain.noncur.service.NoncurRegisterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/noncur")
public class NoncurController {

    private final JwtUtil jwtUtil;
    private final NoncurService service;
    private final NoncurApplicationService applicationService;
    private final NoncurRegisterService registerService;
    
    public NoncurController(NoncurService service, 
                           NoncurApplicationService applicationService,
                           NoncurRegisterService registerService, JwtUtil jwtUtil) {
        this.service = service;
        this.applicationService = applicationService;
        this.registerService = registerService;
        this.jwtUtil = jwtUtil;
    }
    
    //리스트
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
   
    
    //부서목록 조회 api
    @GetMapping("/departments")
    @ResponseBody
    public ResponseEntity<List<Map<String, String>>> getAllDepartments() {
        try {
            List<Map<String, String>> departments = service.getAllDepartments();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            e.printStackTrace();
            // 오류 발생 시 기본 부서 목록 반환
            List<Map<String, String>> defaultDepts = Arrays.asList(
                Map.of("deptCd", "DEPT001", "deptNm", "학생지원팀"),
                Map.of("deptCd", "DEPT002", "deptNm", "교무팀"),
                Map.of("deptCd", "DEPT003", "deptNm", "취업지원센터"),
                Map.of("deptCd", "DEPT004", "deptNm", "SW교육센터")
            );
            return ResponseEntity.ok(defaultDepts);
        }
    }
    
    
    // ===========================================
    // 프로그램 등록/수정/삭제 API
    // ===========================================
    
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
     * 프로그램 등록
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
     * 프로그램 수정
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
     * 프로그램 삭제
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
     * 핵심역량 매핑 API (개별 관리용)
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
    
    // ===========================================
    // 신청 관련 API 
    // ===========================================
    
    @PostMapping("/{prgId}/apply")
    @ResponseBody
    public ResponseEntity<?> applyProgram(
            @PathVariable("prgId") String prgId,
            @Valid @RequestBody NoncurApplicationRequestDTO requestDTO,
            HttpServletRequest request) {
        try {
            // JWT에서 학번 추출
            String stdNo = extractStdNoFromToken(request);
            if (stdNo == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
            }
            
            // 서비스에 필요한 정보 전달
            NoncurApplicationDTO result = applicationService.applyProgram(prgId, stdNo, requestDTO);
            return ResponseEntity.ok(result);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "신청 처리 중 오류가 발생했습니다."));
        }
    }
    
    private String extractStdNoFromToken(HttpServletRequest request) {
        String accessToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (accessToken != null && jwtUtil.isValidToken(accessToken)) {
            return jwtUtil.getIdentifierNo(accessToken); // 학번 추출
        }
        return null;
    }
    
    
    
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
}