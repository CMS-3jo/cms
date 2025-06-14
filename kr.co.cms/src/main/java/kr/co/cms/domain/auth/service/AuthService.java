package kr.co.cms.domain.auth.service;

import kr.co.cms.domain.auth.dto.LoginRequest;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.dto.RefreshRequest;
import kr.co.cms.domain.auth.entity.RefreshToken;
import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.entity.UserRole;
import kr.co.cms.domain.auth.repository.RefreshTokenRepository;
import kr.co.cms.domain.auth.repository.UserRepository;
import kr.co.cms.domain.auth.repository.UserRoleRepository;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. 사용자 찾기
        User user = userRepository.findByUserId(request.getId());
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다");
        }
        
        // 2. 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다");
        }
        
        // 3. 권한 조회
        UserRole userRole = userRoleRepository.findByUserId(user.getUserId());
        String role = userRole != null ? userRole.getRoleType() : "USER";
        
        // 4. 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(user.getUserId(), role);
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
        
        // 5. 리프레시 토큰 저장
        refreshTokenRepository.deleteByUserId(user.getUserId());
        
        RefreshToken tokenEntity = new RefreshToken();
        tokenEntity.setUserId(user.getUserId());
        tokenEntity.setRefreshToken(refreshToken);
        tokenEntity.setExpiresAt(LocalDateTime.now().plusDays(30));
        refreshTokenRepository.save(tokenEntity);
        
        return new LoginResponse(accessToken, refreshToken, user.getUserId(), role, "로그인 성공");
    }
    
    public LoginResponse refreshToken(RefreshRequest request) {
        // 1. 리프레시 토큰 검증
        if (!jwtUtil.isValidToken(request.getRefreshToken())) {
            throw new RuntimeException("유효하지 않은 리프레시 토큰입니다");
        }
        
        // 2. 데이터베이스에서 토큰 조회
        RefreshToken tokenEntity = refreshTokenRepository.findByRefreshToken(request.getRefreshToken());
        if (tokenEntity == null || tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("만료된 리프레시 토큰입니다");
        }
        
        // 3. 권한 조회
        UserRole userRole = userRoleRepository.findByUserId(tokenEntity.getUserId());
        String role = userRole != null ? userRole.getRoleType() : "USER";
        
        // 4. 새로운 액세스 토큰 생성
        String newAccessToken = jwtUtil.generateAccessToken(tokenEntity.getUserId(), role);
        
        return new LoginResponse(newAccessToken, request.getRefreshToken(), tokenEntity.getUserId(), role, "토큰 갱신 성공");
    }
    
    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
