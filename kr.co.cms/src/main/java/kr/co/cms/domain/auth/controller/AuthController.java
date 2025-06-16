package kr.co.cms.domain.auth.controller;

import kr.co.cms.domain.auth.dto.LoginRequest;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.dto.RefreshRequest;
import kr.co.cms.domain.auth.dto.CreateUserRequest;
import kr.co.cms.domain.auth.dto.UpdateUserRequest;
import kr.co.cms.domain.auth.dto.UserResponse;
import kr.co.cms.domain.auth.service.AuthService;
import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            log.info("일반 로그인 시도: userId = {}", request.getId());
            
            LoginResponse loginResponse = authService.login(request);
            
            // 🔄 변경: Access Token도 HttpOnly Cookie로 설정 (소셜 로그인과 동일)
            if (loginResponse.getAccessToken() != null) {
                Cookie accessCookie = new Cookie("accessToken", loginResponse.getAccessToken());
                accessCookie.setHttpOnly(true);        // JavaScript 접근 차단
                accessCookie.setSecure(false);         // 개발환경에서는 false (운영에서는 true)
                accessCookie.setPath("/");
                accessCookie.setMaxAge(24 * 60 * 60);  // 24시간 (소셜 로그인과 동일)
                response.addCookie(accessCookie);
                log.info("Access Token을 HttpOnly Cookie로 설정: userId = {}", request.getId());
            }
            
            // Refresh Token을 HttpOnly Cookie로 설정 (기존과 동일)
            if (loginResponse.getRefreshToken() != null) {
                Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
                refreshCookie.setHttpOnly(true);        // JavaScript 접근 차단
                refreshCookie.setSecure(false);         // 개발환경에서는 false (운영에서는 true)
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
                response.addCookie(refreshCookie);
                log.info("Refresh Token을 HttpOnly Cookie로 설정: userId = {}", request.getId());
            }
            
            // 🔄 변경: 응답에서는 토큰들 제거하고 로그인 성공 정보만 반환
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
    public ResponseEntity<?> refresh(HttpServletRequest request) {
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
            
            // 🔄 변경: 갱신된 토큰들도 모두 Cookie로 설정
            if (loginResponse.getAccessToken() != null) {
                Cookie accessCookie = new Cookie("accessToken", loginResponse.getAccessToken());
                accessCookie.setHttpOnly(true);
                accessCookie.setSecure(false);
                accessCookie.setPath("/");
                accessCookie.setMaxAge(24 * 60 * 60); // 24시간
                ((HttpServletResponse) request.getAttribute("response")).addCookie(accessCookie);
            }
            
            // 🔄 변경: 응답에서는 토큰 제거하고 갱신 성공 정보만 반환
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
            
            // 🔄 변경: 쿠키에서 토큰들 삭제
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
    
    // 🆕 추가: 현재 로그인 상태 확인 API (쿠키 기반)
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
            
            // TODO: JWT 토큰 검증 및 사용자 정보 추출 로직
            // JwtUtil을 사용하여 토큰에서 사용자 정보 추출
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("message", "인증된 사용자");
            // responseData.put("userId", extractedUserId);
            // responseData.put("role", extractedRole);
            // responseData.put("name", extractedName);
            
            return ResponseEntity.ok(responseData);
            
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("사용자 정보 조회 실패: " + e.getMessage());
        }
    }
    
    // 🔄 수정: refresh 메서드에서 HttpServletResponse 파라미터 추가
    @PostMapping("/refresh-updated")  
    public ResponseEntity<?> refreshUpdated(HttpServletRequest request, HttpServletResponse response) {
        try {
            log.info("토큰 갱신 요청 (수정된 버전)");
            
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
    
    // 사용자 생성
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            // 중복 체크
            if (userRepository.findByUserId(request.getUserId()) != null) {
                return ResponseEntity.badRequest().body("이미 존재하는 사용자 ID입니다");
            }
            
            // 사용자 생성
            User user = new User();
            user.setUserId(request.getUserId());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(request.getAccountStatus() != null ? request.getAccountStatus() : "ACTIVE");
            
            userRepository.save(user);
            
            UserResponse response = new UserResponse(user.getUserId(), user.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("사용자 생성 실패: " + e.getMessage());
        }
    }
    
    // 사용자 수정
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UpdateUserRequest request) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다");
            }
            
            // 비밀번호 변경 (입력된 경우만)
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            // 상태 변경
            if (request.getAccountStatus() != null) {
                user.setStatus(request.getAccountStatus());
            }
            
            userRepository.save(user);
            
            UserResponse response = new UserResponse(user.getUserId(), user.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("사용자 수정 실패: " + e.getMessage());
        }
    }
    
    // 사용자 조회
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다");
            }
            
            UserResponse response = new UserResponse(user.getUserId(), user.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("사용자 조회 실패: " + e.getMessage());
        }
    }
    
    // 전체 사용자 목록
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserResponse> response = users.stream()
                .map(user -> new UserResponse(user.getUserId(), user.getStatus()))
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("사용자 목록 조회 실패: " + e.getMessage());
        }
    }
    
    // 사용자 삭제
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다");
            }
            
            userRepository.delete(user);
            return ResponseEntity.ok("사용자 삭제 성공: " + userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("사용자 삭제 실패: " + e.getMessage());
        }
    }
}