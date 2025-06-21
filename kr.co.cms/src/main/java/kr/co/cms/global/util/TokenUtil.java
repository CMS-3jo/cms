package kr.co.cms.global.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

/**
 * HTTP 요청에서 JWT 토큰 추출 및 검증 유틸리티
 */
@Component
@RequiredArgsConstructor
public class TokenUtil {
    
    private final JwtUtil jwtUtil;
    
    /**
     * HTTP 요청에서 사용자 ID 추출
     */
    public String getUserIdFromRequest(HttpServletRequest request) {
        String accessToken = getAccessTokenFromCookies(request);
        
        if (accessToken == null) {
            throw new RuntimeException("Access Token이 없습니다. 로그인이 필요합니다.");
        }
        
        if (!jwtUtil.isValidToken(accessToken)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        
        return jwtUtil.getUserId(accessToken);
    }
    
    /**
     * HTTP 요청에서 식별번호(학번/사번) 추출
     */
    public String getIdentifierNoFromRequest(HttpServletRequest request) {
        String accessToken = getAccessTokenFromCookies(request);
        
        if (accessToken == null) {
            throw new RuntimeException("Access Token이 없습니다. 로그인이 필요합니다.");
        }
        
        if (!jwtUtil.isValidToken(accessToken)) {
            throw new RuntimeException("유효하지 않은 토큰입니다.");
        }
        
        return jwtUtil.getIdentifierNo(accessToken);
    }
    
    /**
     * 쿠키에서 accessToken 추출
     */
    private String getAccessTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}