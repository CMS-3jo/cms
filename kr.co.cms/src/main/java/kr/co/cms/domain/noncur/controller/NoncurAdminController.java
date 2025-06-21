package kr.co.cms.domain.noncur.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import kr.co.cms.domain.noncur.dto.*;
import kr.co.cms.domain.noncur.service.NoncurAdminService;
import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.service.MileageService;
import kr.co.cms.global.util.JwtUtil;
import kr.co.cms.global.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import kr.co.cms.domain.mypage.repository.MyPageRepository;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


//비교과 프로그램 관리자 전용 API 컨트롤러
@RestController
@RequestMapping("/api/admin/noncur")
@RequiredArgsConstructor
public class NoncurAdminController {

    private final NoncurAdminService adminService;
    private final MileageService mileageService;
    private final JwtUtil jwtUtil;
    private final MyPageRepository myPageRepository;
    private final TokenUtil tokenUtil;
    

    //특정 프로그램의 신청자 목록 조회 (관리자용)
    @GetMapping("/{prgId}/applications")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getProgramApplications(
            @PathVariable("prgId") String prgId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "statusCd",required = false) String statusCd,
            HttpServletRequest request) {
        try {
            // 관리자 권한 확인
            String userId = tokenUtil.getUserIdFromRequest(request);
            if (!adminService.hasPermission(userId, prgId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            Map<String, Object> result = adminService.getProgramApplications(prgId, page, size, statusCd);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "신청자 목록 조회 중 오류가 발생했습니다."));
        }
    }
    

    //신청 상태 변경 (승인/거부)
    @PutMapping("/applications/{aplyId}/status")
    @ResponseBody
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable("aplyId") String aplyId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String statusCd = request.get("statusCd");
            String rejectReason = request.get("rejectReason");
            
            // 관리자 권한 확인
            String userId = tokenUtil.getUserIdFromRequest(httpRequest);
            if (!adminService.hasApplicationPermission(userId, aplyId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            adminService.updateApplicationStatus(aplyId, statusCd, rejectReason, userId);
            return ResponseEntity.ok(Map.of("message", "신청 상태가 변경되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "상태 변경 중 오류가 발생했습니다."));
        }
    }
    

    //여러 신청의 상태를 일괄 변경 (승인/거부)
    @PutMapping("/applications/batch-status")
    @ResponseBody
    public ResponseEntity<?> batchUpdateStatus(
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        try {
            List<String> aplyIds = (List<String>) request.get("aplyIds");
            String statusCd = (String) request.get("statusCd");
            
            String userId = tokenUtil.getUserIdFromRequest(httpRequest);
            
            int updated = adminService.batchUpdateStatus(aplyIds, statusCd, userId);
            return ResponseEntity.ok(Map.of(
                "message", updated + "건의 신청 상태가 변경되었습니다.",
                "updatedCount", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "일괄 처리 중 오류가 발생했습니다."));
        }
    }
    
    //프로그램 상태 변경 (모집중/모집완료/운영중/종료)
    @PutMapping("/{prgId}/status")
    @ResponseBody
    public ResponseEntity<?> updateProgramStatus(
            @PathVariable("prgId") String prgId,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String statusCd = request.get("statusCd");
            
            String userId = tokenUtil.getUserIdFromRequest(httpRequest);
            if (!adminService.hasPermission(userId, prgId)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            adminService.updateProgramStatus(prgId, statusCd, userId);
            return ResponseEntity.ok(Map.of("message", "프로그램 상태가 변경되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "상태 변경 중 오류가 발생했습니다."));
        }
    }
    

    // 이수완료 처리 및  마일리지 부여
    @PostMapping("/applications/{aplyId}/complete")
    @ResponseBody
    public ResponseEntity<?> completeApplication(
            @PathVariable("aplyId") String aplyId,
            HttpServletRequest httpRequest) {
        try {
            String userId = tokenUtil.getUserIdFromRequest(httpRequest);
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
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "이수완료 처리 중 오류가 발생했습니다."));
        }
    }
    

    //여러 신청을 일괄 이수완료 처리
    @PostMapping("/applications/batch-complete")
    @ResponseBody
    public ResponseEntity<?> batchCompleteApplications(
            @RequestBody Map<String, List<String>> request,
            HttpServletRequest httpRequest) {
        try {
            List<String> aplyIds = request.get("aplyIds");
            String userId = tokenUtil.getUserIdFromRequest(httpRequest);
            
            Map<String, Object> result = adminService.batchCompleteApplications(aplyIds, userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "일괄 이수완료 처리되었습니다.",
                "result", result
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "일괄 처리 중 오류가 발생했습니다."));
        }
    }
    

    //특정 부서의 프로그램 목록 조회 (관리자용)
    @GetMapping("/departments/{deptCd}/programs")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDepartmentPrograms(
            @PathVariable("deptCd") String deptCd,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            HttpServletRequest request) {
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            // 부서 권한 체크
            if (!adminService.hasDepartmentPermission(userId, deptCd)) {
                return ResponseEntity.status(403).body(Map.of("error", "권한이 없습니다."));
            }
            
            Map<String, Object> result = adminService.getDepartmentPrograms(deptCd, page, size);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "프로그램 목록 조회 중 오류가 발생했습니다."));
        }
    }
    

    //비교과 프로그램 운영 통계 조회
    @GetMapping("/statistics")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(name = "deptCd", required = false) String deptCd,
            HttpServletRequest request) {
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            Map<String, Object> statistics = adminService.getStatistics(userId, deptCd);
            return ResponseEntity.ok(statistics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "통계 조회 중 오류가 발생했습니다."));
        }
    }
    

    //내 부서의 프로그램 목록 조회
    @GetMapping("/departments/my/programs")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMyDepartmentPrograms(
            HttpServletRequest request,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            String deptCd = adminService.getUserDepartment(userId);
            
            if (deptCd == null) {
                return ResponseEntity.ok(Map.of("programs", new ArrayList<>()));
            }
            
            Map<String, Object> result = adminService.getDepartmentPrograms(deptCd, page, size);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "부서 프로그램 조회 중 오류가 발생했습니다."));
        }
    }
}