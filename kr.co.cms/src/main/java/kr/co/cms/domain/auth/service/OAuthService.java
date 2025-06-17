package kr.co.cms.domain.auth.service;

import kr.co.cms.domain.auth.dto.*;
import kr.co.cms.domain.auth.entity.GuestSocialUser;
import kr.co.cms.domain.auth.repository.GuestSocialUserRepository;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuthService {
    
    private final GuestSocialUserRepository guestSocialUserRepository;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // OAuth 설정값들 (application.yml에서 읽어옴)
    @Value("${spring.social.kakao.client-id}")
    private String kakaoClientId;
    
    @Value("${spring.social.kakao.redirect-uri}")
    private String kakaoRedirectUri;
    
    @Value("${spring.social.google.client-id}")
    private String googleClientId;
    
    @Value("${spring.social.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${spring.social.google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${spring.social.naver.client-id}")
    private String naverClientId;
    
    @Value("${spring.social.naver.client-secret}")
    private String naverClientSecret;
    
    @Value("${spring.social.naver.redirect-uri}")
    private String naverRedirectUri;
    
    /**
     * 네이버용 State 파라미터 생성
     */
    private String generateState() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * OAuth 인증 URL 생성
     */
    public String generateAuthUrl(String provider) {
        switch (provider) {
            case "KAKAO":
                return String.format(
                    "https://kauth.kakao.com/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code",
                    kakaoClientId, kakaoRedirectUri
                );
            case "GOOGLE":
                // URL 인코딩
                return String.format(
                    "https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid profile email",
                    googleClientId, googleRedirectUri
                );
            case "NAVER":
                // state 파라미터 추가
                String state = generateState();
                return String.format(
                    "https://nid.naver.com/oauth2.0/authorize?client_id=%s&redirect_uri=%s&response_type=code&state=%s",
                    naverClientId, naverRedirectUri, state
                );
            default:
                throw new IllegalArgumentException("지원하지 않는 OAuth 제공자입니다: " + provider);
        }
    }
    
    /**
     * OAuth 콜백 처리 및 JWT 토큰 생성
     */
    public LoginResponse processOAuthCallback(String provider, String code) {
        try {
            log.info("OAuth 콜백 처리 시작: provider = {}, code = {}", provider, code);
            
            // 1. Authorization Code로 Access Token 요청
            String accessToken = getAccessToken(provider, code);
            log.info("Access Token 획득 성공: provider = {}", provider);
            
            // 2. Access Token으로 사용자 정보 조회
            SocialUserInfo userInfo = getUserInfo(provider, accessToken);
            log.info("사용자 정보 조회 성공: provider = {}, email = {}", provider, userInfo.getEmail());
            
            // 3. 사용자 존재 여부 확인
            Optional<GuestSocialUser> existingUser = guestSocialUserRepository
                .findActiveUserByProviderAndProviderId(provider, userInfo.getProviderId());
            
            GuestSocialUser user;
            boolean isNewUser = false;
            
            if (existingUser.isPresent()) {
                // 기존 회원 - 로그인 처리
                user = existingUser.get();
                isNewUser = false;
                log.info("기존 {} 회원 로그인: {}", provider, user.getEmail());
                
                // 사용자 정보 업데이트 (이름, 프로필 이미지 등이 변경되었을 수 있음)
                updateUserInfo(user, userInfo);
            } else {
                // 신규 회원 - 자동 회원가입 후 로그인
                user = createNewOAuthUser(provider, userInfo);
                isNewUser = true;
                log.info("신규 {} 회원 가입 및 로그인: {}", provider, user.getEmail());
            }
            
            // 4. JWT 토큰 생성
            String jwtToken = generateJwtToken(user);
            String refreshToken = generateRefreshToken(user);
            
            // 5. LoginResponse 생성
            return createLoginResponse(jwtToken, refreshToken, user, isNewUser);
            
        } catch (Exception e) {
            log.error("OAuth 콜백 처리 실패: provider = {}, error = {}", provider, e.getMessage(), e);
            throw new RuntimeException("OAuth 로그인 처리에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * JWT 토큰 생성
     */
    private String generateJwtToken(GuestSocialUser user) {
        try {
            return jwtUtil.generateAccessToken(
                user.getProviderId(),    // userId
                "GUEST",              // role - 교외 회원 역할
                user.getDisplayName()    // name - displayName 사용
            );
        } catch (Exception e) {
            log.warn("JWT 토큰 생성 방식 조정: {}", e.getMessage());
            // 기본 메서드 사용
            return jwtUtil.generateAccessToken(user.getProviderId(), "GUEST");
        }
    }
    
    /**
     * Refresh 토큰 생성
     */
    private String generateRefreshToken(GuestSocialUser user) {
        try {
            return jwtUtil.generateRefreshToken(user.getProviderId());
        } catch (Exception e) {
            log.warn("Refresh 토큰 생성 실패, 이메일로 재시도: {}", e.getMessage());
            return jwtUtil.generateRefreshToken(user.getEmail());
        }
    }
    
    /**
     * LoginResponse 생성
     */
    private LoginResponse createLoginResponse(String jwtToken, String refreshToken, 
                                            GuestSocialUser user, boolean isNewUser) {
        try {
            String message = isNewUser ? "신규 OAuth 회원가입 및 로그인 성공" : "OAuth 로그인 성공";
            
            return new LoginResponse(
                jwtToken,                    // accessToken
                refreshToken,                // refreshToken  
                user.getProviderId(),        // userId (providerId 사용)
                "EXTERNAL",                  // role
                user.getDisplayName(),       // name
                user.getProviderId(),        // identifierNo (providerId 사용)
                message                      // message
            );
        } catch (Exception e) {
            log.warn("LoginResponse 생성 실패, 기본 생성자 사용: {}", e.getMessage());
            
            // 기본 생성자로 폴백
            LoginResponse response = new LoginResponse();
            response.setAccessToken(jwtToken);
            response.setRefreshToken(refreshToken);
            response.setUserId(user.getProviderId());
            response.setRole("EXTERNAL");
            response.setName(user.getDisplayName());
            response.setIdentifierNo(user.getProviderId());
            response.setMessage(isNewUser ? "신규 OAuth 회원가입 및 로그인 성공" : "OAuth 로그인 성공");
            
            return response;
        }
    }
    
    /**
     * Authorization Code로 Access Token 요청
     */
    private String getAccessToken(String provider, String code) {
        switch (provider) {
            case "KAKAO":
                return getKakaoAccessToken(code);
            case "GOOGLE":
                return getGoogleAccessToken(code);
            case "NAVER":
                return getNaverAccessToken(code);
            default:
                throw new IllegalArgumentException("지원하지 않는 OAuth 제공자입니다: " + provider);
        }
    }
    
    /**
     * Access Token으로 사용자 정보 조회
     */
    private SocialUserInfo getUserInfo(String provider, String accessToken) {
        switch (provider) {
            case "KAKAO":
                return getKakaoUserInfo(accessToken);
            case "GOOGLE":
                return getGoogleUserInfo(accessToken);
            case "NAVER":
                return getNaverUserInfo(accessToken);
            default:
                throw new IllegalArgumentException("지원하지 않는 OAuth 제공자입니다: " + provider);
        }
    }
    
    /**
     * 카카오 Access Token 요청
     */
    private String getKakaoAccessToken(String code) {
        String url = "https://kauth.kakao.com/oauth/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", kakaoClientId);
        params.add("redirect_uri", kakaoRedirectUri);
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(url, request, TokenResponse.class);
        return response.getBody().getAccess_token();
    }
    
    /**
     * 카카오 사용자 정보 조회
     */
    private SocialUserInfo getKakaoUserInfo(String accessToken) {
        String url = "https://kapi.kakao.com/v2/user/me";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<KakaoUserInfo> response = restTemplate.exchange(
            url, HttpMethod.GET, request, KakaoUserInfo.class
        );
        
        KakaoUserInfo kakaoUserInfo = response.getBody();
        KakaoUserInfo.KakaoAccount kakaoAccount = kakaoUserInfo.getKakao_account();
        KakaoUserInfo.KakaoAccount.Profile profile = kakaoAccount.getProfile();
        
        return SocialUserInfo.builder()
            .providerId(kakaoUserInfo.getId().toString())
            .provider("KAKAO")
            .email(kakaoAccount.getEmail())
            .name(profile.getNickname())
            .nickname(profile.getNickname())
            .profileImageUrl(profile.getProfile_image_url())
            .build();
    }
    
    /**
     * 구글 Access Token 요청
     */
    private String getGoogleAccessToken(String code) {
        String url = "https://oauth2.googleapis.com/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(url, request, TokenResponse.class);
        return response.getBody().getAccess_token();
    }
    
    /**
     * 구글 사용자 정보 조회
     */
    private SocialUserInfo getGoogleUserInfo(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v2/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
            url, HttpMethod.GET, request, GoogleUserInfo.class
        );
        
        GoogleUserInfo googleUserInfo = response.getBody();
        
        return SocialUserInfo.builder()
            .providerId(googleUserInfo.getId())
            .provider("GOOGLE")
            .email(googleUserInfo.getEmail())
            .name(googleUserInfo.getName())
            .nickname(googleUserInfo.getGiven_name())
            .profileImageUrl(googleUserInfo.getPicture())
            .build();
    }
    
    /**
     * 네이버 Access Token 요청
     */
    private String getNaverAccessToken(String code) {
        String url = "https://nid.naver.com/oauth2.0/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", naverClientId);
        params.add("client_secret", naverClientSecret);
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        ResponseEntity<TokenResponse> response = restTemplate.postForEntity(url, request, TokenResponse.class);
        return response.getBody().getAccess_token();
    }
    
    /**
     * 네이버 사용자 정보 조회
     */
    private SocialUserInfo getNaverUserInfo(String accessToken) {
        String url = "https://openapi.naver.com/v1/nid/me";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<NaverUserInfo> response = restTemplate.exchange(
            url, HttpMethod.GET, request, NaverUserInfo.class
        );
        
        NaverUserInfo naverUserInfo = response.getBody();
        NaverUserInfo.NaverResponse naverResponse = naverUserInfo.getResponse();
        
        return SocialUserInfo.builder()
            .providerId(naverResponse.getId())
            .provider("NAVER")
            .email(naverResponse.getEmail())
            .name(naverResponse.getName())
            .nickname(naverResponse.getNickname())
            .profileImageUrl(naverResponse.getProfile_image())
            .build();
    }
    
    /**
     * 신규 OAuth 사용자 생성
     */
    private GuestSocialUser createNewOAuthUser(String provider, SocialUserInfo userInfo) {
        GuestSocialUser newUser = GuestSocialUser.builder()
            .provider(provider)
            .providerId(userInfo.getProviderId())
            .email(userInfo.getEmail())
            .displayName(userInfo.getName())  // name -> displayName 매핑
            .profileImageUrl(userInfo.getProfileImageUrl())
            .accountStatus("ACTIVE")
            .createdDate(LocalDateTime.now())
            .build();
            
        return guestSocialUserRepository.save(newUser);
    }
    
    /**
     * 기존 사용자 정보 업데이트
     */
    private void updateUserInfo(GuestSocialUser user, SocialUserInfo userInfo) {
        boolean updated = false;
        
        // 이름이 변경된 경우 (displayName 업데이트)
        if (userInfo.getName() != null && !userInfo.getName().equals(user.getDisplayName())) {
            user.setDisplayName(userInfo.getName());
            updated = true;
        }
        
        // 프로필 이미지가 변경된 경우
        if (userInfo.getProfileImageUrl() != null && !userInfo.getProfileImageUrl().equals(user.getProfileImageUrl())) {
            user.setProfileImageUrl(userInfo.getProfileImageUrl());
            updated = true;
        }
        
        if (updated) {
            // 마지막 로그인 시간을 업데이트 시간으로 사용
            user.setLastLoginDate(LocalDateTime.now());
            guestSocialUserRepository.save(user);
            log.info("사용자 정보 업데이트됨: {}", user.getEmail());
        }
    }
    
    /**
     * 토큰 응답 DTO (내부 사용용)
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class TokenResponse {
        private String access_token;
        private String token_type;
        private String refresh_token;
        private Integer expires_in;
        private String scope;
    }
}