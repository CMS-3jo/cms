package kr.co.cms.domain.auth.controller;

import kr.co.cms.domain.auth.dto.CreateRegisteredUserRequest;
import kr.co.cms.domain.auth.dto.CreateUserResponse;
import kr.co.cms.domain.auth.dto.LoginRequest;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.dto.RefreshRequest;
import kr.co.cms.domain.auth.service.AuthService;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            log.info("일반 로그인 시도: userId = {}", request.getId());
            
            LoginResponse loginResponse = authService.login(request);
            
            // Access Token을 HttpOnly Cookie로 설정
            if (loginResponse.getAccessToken() != null) {
                Cookie accessCookie = new Cookie("accessToken", loginResponse.getAccessToken());
                accessCookie.setHttpOnly(true);        // JavaScript 접근 차단
                accessCookie.setSecure(false);         // 개발환경에서는 false (운영에서는 true)
                accessCookie.setPath("/");
                accessCookie.setMaxAge(24 * 60 * 60);  // 24시간
                response.addCookie(accessCookie);
                log.info("Access Token을 HttpOnly Cookie로 설정: userId = {}", request.getId());
            }
            
            // Refresh Token을 HttpOnly Cookie로 설정
            if (loginResponse.getRefreshToken() != null) {
                Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
                refreshCookie.setHttpOnly(true);        // JavaScript 접근 차단
                refreshCookie.setSecure(false);         // 개발환경에서는 false (운영에서는 true)
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
                response.addCookie(refreshCookie);
                log.info("Refresh Token을 HttpOnly Cookie로 설정: userId = {}", request.getId());
            }
            
            // 응답에서는 토큰들 제거하고 로그인 성공 정보만 반환
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("userId", loginResponse.getUserId());
            responseData.put("role", loginResponse.getRole());
            responseData.put("name", loginResponse.getName());
            responseData.put("identifierNo", loginResponse.getIdentifierNo());
            responseData.put("message", loginResponse.getMessage());
            
            log.info("일반 로그인 성공: userId = {}, name = {}, role = {}", 
                    loginResponse.getUserId(), loginResponse.getName(), loginResponse.getRole());
            
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            log.error("일반 로그인 실패: userId = {}, error = {}", request.getId(), e.getMessage());
            return ResponseEntity.badRequest().body("로그인 실패: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")  
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("토큰 갱신 요청");
            
            // HttpOnly Cookie에서 refreshToken 추출
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }
            
            if (refreshToken == null) {
                log.warn("Refresh Token이 Cookie에서 발견되지 않음");
                return ResponseEntity.badRequest().body("Refresh token not found");
            }
            
            RefreshRequest refreshRequest = new RefreshRequest();
            refreshRequest.setRefreshToken(refreshToken);
            
            LoginResponse loginResponse = authService.refreshToken(refreshRequest);
            
            // 갱신된 Access Token을 Cookie로 설정
            if (loginResponse.getAccessToken() != null) {
                Cookie accessCookie = new Cookie("accessToken", loginResponse.getAccessToken());
                accessCookie.setHttpOnly(true);
                accessCookie.setSecure(false);
                accessCookie.setPath("/");
                accessCookie.setMaxAge(24 * 60 * 60); // 24시간
                response.addCookie(accessCookie);
                log.info("갱신된 Access Token을 Cookie로 설정");
            }
            
            // 응답에서는 토큰 제거하고 갱신 성공 정보만 반환
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("userId", loginResponse.getUserId());
            responseData.put("role", loginResponse.getRole());
            responseData.put("name", loginResponse.getName());
            responseData.put("identifierNo", loginResponse.getIdentifierNo());
            responseData.put("message", "토큰 갱신 성공");
            
            log.info("토큰 갱신 성공: userId = {}", loginResponse.getUserId());
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            log.error("토큰 갱신 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("토큰 갱신 실패: " + e.getMessage());
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal String userId, HttpServletResponse response) {
        try {
            log.info("로그아웃 시도: userId = {}", userId);
            
            authService.logout(userId);
            
            // Access Token 쿠키 삭제
            Cookie accessCookie = new Cookie("accessToken", null);
            accessCookie.setHttpOnly(true);
            accessCookie.setSecure(false);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(0); // 즉시 만료
            response.addCookie(accessCookie);
            
            // Refresh Token 쿠키 삭제
            Cookie refreshCookie = new Cookie("refreshToken", null);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(0); // 즉시 만료
            response.addCookie(refreshCookie);
            
            log.info("로그아웃 성공 및 쿠키 삭제: userId = {}", userId);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("message", "로그아웃 성공");
            
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            log.error("로그아웃 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body("로그아웃 실패: " + e.getMessage());
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            // Cookie에서 accessToken 추출
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
                return ResponseEntity.badRequest().body("로그인이 필요합니다");
            }
            
            // JWT 토큰 검증 및 사용자 정보 추출
            if (!jwtUtil.isValidToken(accessToken)) {
                return ResponseEntity.badRequest().body("유효하지 않은 토큰입니다");
            }
            
            String userId = jwtUtil.getUserId(accessToken);
            String role = jwtUtil.getRole(accessToken);
            String name = jwtUtil.getName(accessToken);
            String identifierNo = jwtUtil.getIdentifierNo(accessToken);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("userId", userId);
            responseData.put("role", role);
            responseData.put("name", name);
            responseData.put("identifierNo", identifierNo);
            responseData.put("message", "인증된 사용자");
            
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("사용자 정보 조회 실패: " + e.getMessage());
        }
    }
    
    // 등록된 사용자 생성 (학생, 상담사, 교수, 관리자)
    @PostMapping("/users/registered")
    public ResponseEntity<?> createRegisteredUser(@RequestBody CreateRegisteredUserRequest request) {
        try {
            log.info("사용자 생성 요청: userId = {}, roleType = {}", request.getUserId(), request.getRoleType());
            
            CreateUserResponse response = authService.createRegisteredUser(request);
            
            log.info("사용자 생성 응답: success = {}, userId = {}", response.isSuccess(), response.getUserId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("사용자 생성 실패: userId = {}, error = {}", 
                    request != null ? request.getUserId() : "null", e.getMessage());
            
            CreateUserResponse errorResponse = CreateUserResponse.builder()
                    .success(false)
                    .message("사용자 생성 실패: " + e.getMessage())
                    .build();
                    
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}