package kr.co.cms.domain.auth.service;

import kr.co.cms.domain.auth.dto.LoginRequest;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.dto.RefreshRequest;
import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.repository.UserRepository;
import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;
import kr.co.cms.domain.mypage.repository.MyPageRepository;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final MyPageRepository myPageRepository;  // 추가
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    // 로그인
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: userId = {}", request.getId());
        
        // 1. 사용자 인증
        User user = userRepository.findByUserId(request.getId());
        if (user == null) {
            throw new RuntimeException("존재하지 않는 사용자입니다: " + request.getId());
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다");
        }
        
        // 2. 사용자 상태 확인
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("비활성화된 계정입니다");
        }
        
        // 3. 통합 뷰에서 사용자 정보 조회 (이름 + 학번/사번)
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(request.getId())
                .orElseThrow(() -> new RuntimeException("사용자 상세 정보를 찾을 수 없습니다: " + request.getId()));
        
        // 4. 사용자 역할 조회 (실제로는 USER_ROLES 테이블에서)
        String role = getUserRole(request.getId());
        
        // 5. JWT 토큰 생성 (아이디, 이름, 권한 포함)
        String accessToken = jwtUtil.generateAccessToken(
            user.getUserId(),              // USER_ID (로그인 ID)
            role,                          // 권한
            userInfo.getUserName(),        // 이름 ⭐
            userInfo.getIdentifierNo()     // 학번/사번 ⭐
        );
        
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
        
        // 6. Refresh Token 저장 (실제로는 DB에 저장)
        // saveRefreshToken(user.getUserId(), refreshToken);
        
        log.info("로그인 성공: userId = {}, name = {}, role = {}, idNo = {}", 
                user.getUserId(), userInfo.getUserName(), role, userInfo.getIdentifierNo());
        
        // 7. 새로운 생성자 사용하여 응답 생성
        return new LoginResponse(
            accessToken,
            refreshToken,
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo(),    // 학번/사번
            "로그인 성공"
        );
    }
    
    // 토큰 갱신
    public LoginResponse refreshToken(RefreshRequest request) {
        log.info("토큰 갱신 요청");
        
        // 1. Refresh Token 검증
        if (!jwtUtil.isValidToken(request.getRefreshToken())) {
            throw new RuntimeException("유효하지 않은 Refresh Token입니다");
        }
        
        // 2. Refresh Token에서 사용자 ID 추출
        String userId = jwtUtil.getUserId(request.getRefreshToken());
        
        // 3. 사용자 정보 다시 조회
        User user = userRepository.findByUserId(userId);
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("사용자 계정이 비활성화되었습니다");
        }
        
        // 4. 통합 뷰에서 최신 사용자 정보 조회
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 상세 정보를 찾을 수 없습니다: " + userId));
        
        // 5. 사용자 역할 조회
        String role = getUserRole(userId);
        
        // 6. 새로운 Access Token 생성
        String newAccessToken = jwtUtil.generateAccessToken(
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo()     // 학번/사번
        );
        
        log.info("토큰 갱신 성공: userId = {}, name = {}", userId, userInfo.getUserName());
        
        // 7. 새로운 생성자 사용하여 응답 생성
        return new LoginResponse(
            newAccessToken,
            request.getRefreshToken(), // 기존 Refresh Token 유지
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo(),    // 학번/사번
            "토큰 갱신 성공"
        );
    }
    
    // 로그아웃
    public void logout(String userId) {
        log.info("로그아웃: userId = {}", userId);
        // TODO: Refresh Token DB에서 삭제
    }
    
    // 사용자 역할 조회 (임시 구현)
    private String getUserRole(String userId) {
        // 실제로는 USER_ROLES 테이블에서 조회해야 함
        // 임시로 사용자 정보에서 추정
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(userId).orElse(null);
        if (userInfo != null && userInfo.getUserType() != null) {
            return userInfo.getUserType();
        }
        return "STUDENT"; // 기본값
    }
}