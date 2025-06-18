package kr.co.cms.domain.noncur.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import kr.co.cms.domain.noncur.dto.*;
import kr.co.cms.domain.noncur.service.NoncurAdminService;
import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.service.MileageService;
import kr.co.cms.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/noncur")
public class NoncurAdminController {

    private final NoncurAdminService adminService;
    private final MileageService mileageService;
    private final JwtUtil jwtUtil;
    
    public NoncurAdminController(NoncurAdminService adminService, 
                                MileageService mileageService,
                                JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.mileageService = mileageService;
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * 프로그램별 신청자 목록 조회
     */
    @GetMapping("/{prgId}/applications")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProgramApplications(
            @PathVariable("prgId") String prgId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String statusCd,
            HttpServletRequest request) {
        try {
            // 권한 체크 (관리자 또는 해당 부서)
            String userId = extractUserIdFromToken(request);
            if (!adminService.hasPermission(userId, prgId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            Map<String, Object> result = adminService.getProgramApplications(prgId, page, size, statusCd);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "신청자 목록 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 신청 상태 변경 (승인/거부)
     */
    @PutMapping("/applications/{aplyId}/status")
    @ResponseBody
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable("aplyId") String aplyId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String statusCd = request.get("statusCd");
            String rejectReason = request.get("rejectReason");
            
            // 권한 체크
            String userId = extractUserIdFromToken(httpRequest);
            if (!adminService.hasApplicationPermission(userId, aplyId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            adminService.updateApplicationStatus(aplyId, statusCd, rejectReason, userId);
            return ResponseEntity.ok(Map.of("message", "신청 상태가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "상태 변경 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 일괄 승인/거부
     */
    @PutMapping("/applications/batch-status")
    @ResponseBody
    public ResponseEntity<?> batchUpdateStatus(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            List<String> aplyIds = (List<String>) request.get("aplyIds");
            String statusCd = (String) request.get("statusCd");
            
            String userId = extractUserIdFromToken(httpRequest);
            
            int updated = adminService.batchUpdateStatus(aplyIds, statusCd, userId);
            return ResponseEntity.ok(Map.of(
                "message", updated + "건의 신청 상태가 변경되었습니다.",
                "updatedCount", updated
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "일괄 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 프로그램 상태 변경
     */
    @PutMapping("/{prgId}/status")
    @ResponseBody
    public ResponseEntity<?> updateProgramStatus(
            @PathVariable("prgId") String prgId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String statusCd = request.get("statusCd");
            
            String userId = extractUserIdFromToken(httpRequest);
            if (!adminService.hasPermission(userId, prgId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            adminService.updateProgramStatus(prgId, statusCd, userId);
            return ResponseEntity.ok(Map.of("message", "프로그램 상태가 변경되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "상태 변경 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 이수완료 처리 (마일리지 부여)
     */
    @PostMapping("/applications/{aplyId}/complete")
    @ResponseBody
    public ResponseEntity<?> completeApplication(
            @PathVariable("aplyId") String aplyId,
            HttpServletRequest httpRequest) {
        try {
            String userId = extractUserIdFromToken(httpRequest);
            if (!adminService.hasApplicationPermission(userId, aplyId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            // 이수완료 처리 및 마일리지 부여
            MileageAwardRequestDTO mileageRequest = adminService.completeApplicationWithMileage(aplyId, userId);
            
            // 마일리지 부여
            mileageService.awardMileage(mileageRequest);
            
            return ResponseEntity.ok(Map.of(
                "message", "이수완료 처리되었습니다.",
                "awardedMileage", mileageRequest
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "이수완료 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 일괄 이수완료 처리
     */
    @PostMapping("/applications/batch-complete")
    @ResponseBody
    public ResponseEntity<?> batchCompleteApplications(
            @RequestBody Map<String, List<String>> request,
            HttpServletRequest httpRequest) {
        try {
            List<String> aplyIds = request.get("aplyIds");
            String userId = extractUserIdFromToken(httpRequest);
            
            Map<String, Object> result = adminService.batchCompleteApplications(aplyIds, userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "일괄 이수완료 처리되었습니다.",
                "result", result
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "일괄 처리 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 부서별 프로그램 목록 조회 (관리자용)
     */
    @GetMapping("/departments/{deptCd}/programs")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDepartmentPrograms(
            @PathVariable("deptCd") String deptCd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            // 부서 권한 체크
            if (!adminService.hasDepartmentPermission(userId, deptCd)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            Map<String, Object> result = adminService.getDepartmentPrograms(deptCd, page, size);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "프로그램 목록 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 통계 조회
     */
    @GetMapping("/statistics")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(required = false) String deptCd,
            HttpServletRequest request) {
        try {
            String userId = extractUserIdFromToken(request);
            Map<String, Object> statistics = adminService.getStatistics(userId, deptCd);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "통계 조회 중 오류가 발생했습니다."));
        }
    }
    
    private String extractUserIdFromToken(HttpServletRequest request) {
        // JWT에서 사용자 ID 추출 로직
        // 실제 구현은 JwtUtil 활용
        return "admin"; // 임시
    }
}