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
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    
	private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.login(request);
            
            // Refresh Token을 HttpOnly Cookie로 설정
            Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
            refreshCookie.setHttpOnly(true);        // JavaScript 접근 차단
            refreshCookie.setSecure(false);         // 개발환경에서는 false (운영에서는 true)
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
            response.addCookie(refreshCookie);
            
            // 응답에서는 refreshToken 제거 (accessToken만 반환)
            loginResponse.setRefreshToken(null);
            
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그인 실패: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")  
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        try {
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
                return ResponseEntity.badRequest().body("Refresh token not found");
            }
            
            RefreshRequest refreshRequest = new RefreshRequest();
            refreshRequest.setRefreshToken(refreshToken);
            
            LoginResponse response = authService.refreshToken(refreshRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("토큰 갱신 실패: " + e.getMessage());
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal String userId) {
        try {
            authService.logout(userId);
            return ResponseEntity.ok("로그아웃 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그아웃 실패: " + e.getMessage());
        }
    }
    
    //
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