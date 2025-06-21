package kr.co.cms.domain.mypage.controller;

import kr.co.cms.domain.mypage.dto.MyPageProfileResponse;
import kr.co.cms.domain.mypage.dto.SimpleResponse;
import kr.co.cms.domain.mypage.service.MyPageService;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage/admin")
@RequiredArgsConstructor
@CrossOrigin(
    origins = "http://localhost:5173", 
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
@Slf4j
public class AdminController {
    
    private final MyPageService myPageService;
    private final JwtUtil jwtUtil;
    
    // 쿠키에서 사용자 ID 추출하는 헬퍼 메서드
    private String getUserIdFromRequest(HttpServletRequest request) {
        // 쿠키에서 accessToken 추출
        String accessToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }
        
        if (accessToken == null) {
            throw new RuntimeException("Access Token이 없습니다. 로그인이 필요합니다.");
        }
        
        // JWT 토큰 검증 및 사용자 ID 추출
        if (!jwtUtil.isValidToken(accessToken)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        
        return jwtUtil.getUserId(accessToken);
    }
    
    // 전체 사용자 목록 조회 (관리자 전용)
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        try {
            String userId = getUserIdFromRequest(request);
            log.info("관리자 사용자 목록 조회 요청: adminId = {}", userId);
            
            // 관리자 권한 확인
            MyPageProfileResponse adminProfile = myPageService.getMyProfile(userId);
            if (!"ADMIN".equals(adminProfile.getUserType())) {
                return ResponseEntity.status(403).body(
                    SimpleResponse.error("관리자 권한이 필요합니다.")
                );
            }
            
            // 전체 사용자 목록 조회
            List<MyPageProfileResponse> userList = myPageService.getAllUsers();
            
            log.info("사용자 목록 조회 완료: count = {}", userList.size());
            
            return ResponseEntity.ok(
                SimpleResponse.success("사용자 목록 조회 성공", userList)
            );
            
        } catch (Exception e) {
            log.error("사용자 목록 조회 실패: error = {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                SimpleResponse.error("사용자 목록 조회에 실패했습니다: " + e.getMessage())
            );
        }
    }
    
    // 사용자 상태 변경 (관리자 전용)
    @PutMapping("/users/{targetUserId}/status")
    public ResponseEntity<?> updateUserStatus(
            HttpServletRequest request,
            @PathVariable String targetUserId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String adminId = getUserIdFromRequest(request);
            log.info("사용자 상태 변경 요청: adminId = {}, targetUserId = {}, status = {}", 
                    adminId, targetUserId, requestBody.get("accountStatus"));
            
            // 관리자 권한 확인
            MyPageProfileResponse adminProfile = myPageService.getMyProfile(adminId);
            if (!"ADMIN".equals(adminProfile.getUserType())) {
                return ResponseEntity.status(403).body(
                    SimpleResponse.error("관리자 권한이 필요합니다.")
                );
            }
            
            String newStatus = requestBody.get("accountStatus");
            if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("INACTIVE"))) {
                return ResponseEntity.badRequest().body(
                    SimpleResponse.error("올바른 상태값이 아닙니다. (ACTIVE 또는 INACTIVE)")
                );
            }
            
            // 자기 자신의 상태는 변경할 수 없음
            if (adminId.equals(targetUserId)) {
                return ResponseEntity.badRequest().body(
                    SimpleResponse.error("자신의 계정 상태는 변경할 수 없습니다.")
                );
            }
            
            // 사용자 상태 변경
            boolean success = myPageService.updateUserAccountStatus(targetUserId, newStatus);
            
            if (success) {
                log.info("사용자 상태 변경 완료: targetUserId = {}, newStatus = {}", targetUserId, newStatus);
                return ResponseEntity.ok(
                    SimpleResponse.success("사용자 상태가 변경되었습니다.")
                );
            } else {
                return ResponseEntity.badRequest().body(
                    SimpleResponse.error("사용자를 찾을 수 없습니다.")
                );
            }
            
        } catch (Exception e) {
            log.error("사용자 상태 변경 실패: targetUserId = {}, error = {}", targetUserId, e.getMessage());
            return ResponseEntity.badRequest().body(
                SimpleResponse.error("사용자 상태 변경에 실패했습니다: " + e.getMessage())
            );
        }
    }
    
    // 사용자 삭제 (관리자 전용)
    @DeleteMapping("/users/{targetUserId}")
    public ResponseEntity<?> deleteUser(
            HttpServletRequest request,
            @PathVariable String targetUserId) {
        try {
            String adminId = getUserIdFromRequest(request);
            log.info("사용자 삭제 요청: adminId = {}, targetUserId = {}", adminId, targetUserId);
            
            // 관리자 권한 확인
            MyPageProfileResponse adminProfile = myPageService.getMyProfile(adminId);
            if (!"ADMIN".equals(adminProfile.getUserType())) {
                return ResponseEntity.status(403).body(
                    SimpleResponse.error("관리자 권한이 필요합니다.")
                );
            }
            
            // 자기 자신은 삭제할 수 없음
            if (adminId.equals(targetUserId)) {
                return ResponseEntity.badRequest().body(
                    SimpleResponse.error("자신의 계정은 삭제할 수 없습니다.")
                );
            }
            
            // 사용자 삭제
            boolean success = myPageService.deleteUser(targetUserId);
            
            if (success) {
                log.info("사용자 삭제 완료: targetUserId = {}", targetUserId);
                return ResponseEntity.ok(
                    SimpleResponse.success("사용자가 삭제되었습니다.")
                );
            } else {
                return ResponseEntity.badRequest().body(
                    SimpleResponse.error("사용자를 찾을 수 없습니다.")
                );
            }
            
        } catch (Exception e) {
            log.error("사용자 삭제 실패: targetUserId = {}, error = {}", targetUserId, e.getMessage());
            return ResponseEntity.badRequest().body(
                SimpleResponse.error("사용자 삭제에 실패했습니다: " + e.getMessage())
            );
        }
    }
}