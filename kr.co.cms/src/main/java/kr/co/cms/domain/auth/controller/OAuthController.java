package kr.co.cms.domain.auth.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.service.OAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth/oauth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class OAuthController {
    
    private final OAuthService oAuthService;
    
    // OPTIONS 요청 처리 (Preflight)
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }
    
    // OAuth 로그인 URL 생성
    @GetMapping("/{provider}/url")
    public ResponseEntity<?> getOAuthUrl(@PathVariable("provider") String provider) {
        try {
//            log.info("OAuth URL 요청: provider = {}", provider);
            
            String authUrl = oAuthService.generateAuthUrl(provider.toUpperCase());
            
            Map<String, String> response = new HashMap<>();
            response.put("provider", provider.toUpperCase());
            response.put("authUrl", authUrl);
            
//            log.info("OAuth URL 생성 성공: provider = {}, url = {}", provider, authUrl);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
//            log.error("OAuth URL 생성 실패: provider = {}, error = {}", provider, e.getMessage(), e);
            return ResponseEntity.badRequest().body("OAuth URL 생성 실패: " + e.getMessage());
        }
    }
    
    // OAuth 콜백 처리 (Authorization Code 받기) - 모든 제공자 통일
    @GetMapping("/{provider}/callback")
    public void handleOAuthCallback(
            @PathVariable("provider") String provider,
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        try {
//            log.info("OAuth 콜백 처리: provider = {}, code = {}", provider, code);
            
            // OAuth 처리 및 JWT 토큰 생성
            LoginResponse loginResponse = oAuthService.processOAuthCallback(provider.toUpperCase(), code);
            
            // Access Token을 HttpOnly Cookie로 설정
            if (loginResponse.getAccessToken() != null) {
                Cookie accessCookie = new Cookie("accessToken", loginResponse.getAccessToken());
                accessCookie.setHttpOnly(true);
                accessCookie.setSecure(false);
                accessCookie.setPath("/");
                accessCookie.setMaxAge(24 * 60 * 60); // 24시간
                response.addCookie(accessCookie);
//                log.info("Access Token을 HttpOnly Cookie로 설정: provider = {}", provider);
            }
            
            // Refresh Token을 HttpOnly Cookie로 설정 
            if (loginResponse.getRefreshToken() != null) {
                Cookie refreshCookie = new Cookie("refreshToken", loginResponse.getRefreshToken());
                refreshCookie.setHttpOnly(true);
                refreshCookie.setSecure(false);
                refreshCookie.setPath("/");
                refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
                response.addCookie(refreshCookie);
//                log.info("Refresh Token을 HttpOnly Cookie로 설정: provider = {}", provider);
            }
            
            // 사용자 정보를 세션에 저장하여 팝업에서 조회할 수 있도록 함
            request.getSession().setAttribute("oauthSuccess", true);
            request.getSession().setAttribute("userName", loginResponse.getName());
            request.getSession().setAttribute("userRole", loginResponse.getRole());
            request.getSession().setAttribute("userId", loginResponse.getUserId());
            request.getSession().setAttribute("identifierNo", loginResponse.getIdentifierNo());
            
            // 모든 OAuth 제공자를 팝업 콜백 페이지로 리디렉션 
            response.sendRedirect("http://localhost:5173/auth/callback?success=true");
            
        } catch (Exception e) {
//            log.error("OAuth 콜백 처리 실패: provider = {}, error = {}", provider, e.getMessage(), e);
            
            // 에러 정보를 세션에 저장
            request.getSession().setAttribute("oauthSuccess", false);
            request.getSession().setAttribute("oauthError", e.getMessage());
            
            try {
                // 모든 OAuth 제공자를 팝업 콜백 페이지로 에러 리디렉션 
                response.sendRedirect("http://localhost:5173/auth/callback?success=false");
            } catch (IOException ioException) {
//                log.error("리다이렉트 실패: {}", ioException.getMessage());
            }
        }
    }
    
    // OAuth 결과 조회 API 
    @PostMapping("/result")
    public ResponseEntity<?> getOAuthResult(HttpServletRequest request) {
        try {
            Boolean success = (Boolean) request.getSession().getAttribute("oauthSuccess");
            
            if (Boolean.TRUE.equals(success)) {
                String userName = (String) request.getSession().getAttribute("userName");
                String userRole = (String) request.getSession().getAttribute("userRole");
                String userId = (String) request.getSession().getAttribute("userId");
                String identifierNo = (String) request.getSession().getAttribute("identifierNo");
                
                // 세션 정보 정리
                request.getSession().removeAttribute("oauthSuccess");
                request.getSession().removeAttribute("userName");
                request.getSession().removeAttribute("userRole");
                request.getSession().removeAttribute("userId");
                request.getSession().removeAttribute("identifierNo");
                
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("userId", userId);
                result.put("name", userName);
                result.put("role", userRole);
                result.put("identifierNo", identifierNo);
                result.put("message", "OAuth 로그인 성공");
                
                return ResponseEntity.ok(result);
                
            } else {
                String errorMessage = (String) request.getSession().getAttribute("oauthError");
                
                // 세션 정보 정리
                request.getSession().removeAttribute("oauthSuccess");
                request.getSession().removeAttribute("oauthError");
                
                return ResponseEntity.badRequest().body("OAuth 로그인 실패: " + 
                    (errorMessage != null ? errorMessage : "알 수 없는 오류"));
            }
            
        } catch (Exception e) {
//            log.error("OAuth 결과 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("OAuth 결과 조회 실패: " + e.getMessage());
        }
    }

}