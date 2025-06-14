package kr.co.cms.global.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import kr.co.cms.global.config.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {
    
    private final JwtProperties jwtProperties;
    
    // Access Token 생성 (아이디, 이름, 권한 포함)
    public String generateAccessToken(String userId, String role, String name, String identifierNo) {
        return Jwts.builder()
                .setSubject(userId)           // USER_ID (로그인 ID)
                .claim("role", role)          // 권한 (STUDENT, PROFESSOR 등)
                .claim("name", name)          // 이름 (실명)
                .claim("idNo", identifierNo)  // 학번/사번 (실제 업무 식별자)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getAccessExpiration()))
                .signWith(SignatureAlgorithm.HS512, jwtProperties.getSecret())
                .compact();
    }
    
    // Access Token 생성 (이름 포함) - 오버로딩
    public String generateAccessToken(String userId, String role, String name) {
        return generateAccessToken(userId, role, name, null);
    }
    
    // Access Token 생성 (기본) - 오버로딩
    public String generateAccessToken(String userId, String role) {
        return generateAccessToken(userId, role, null, null);
    }
    
    // Refresh Token 생성
    public String generateRefreshToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtProperties.getRefreshExpiration()))
                .signWith(SignatureAlgorithm.HS512, jwtProperties.getSecret())
                .compact();
    }
    
    // 토큰에서 사용자 ID 추출
    public String getUserId(String token) {
        return Jwts.parser()
                .setSigningKey(jwtProperties.getSecret())
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    // 토큰에서 권한 추출
    public String getRole(String token) {
        return Jwts.parser()
                .setSigningKey(jwtProperties.getSecret())
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
    
    // 토큰에서 이름 추출
    public String getName(String token) {
        return Jwts.parser()
                .setSigningKey(jwtProperties.getSecret())
                .parseClaimsJws(token)
                .getBody()
                .get("name", String.class);
    }
    
    // 토큰에서 아이디(학번/사번) 추출
    public String getIdentifierNo(String token) {
        return Jwts.parser()
                .setSigningKey(jwtProperties.getSecret())
                .parseClaimsJws(token)
                .getBody()
                .get("idNo", String.class);
    }
    
    // 토큰 유효성 검증
    public boolean isValidToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtProperties.getSecret()).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}