package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 소셜 로그인 요청 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialLoginRequest {
    private String provider;        // "GOOGLE", "KAKAO", "NAVER"
    private String accessToken;     // 소셜 서비스에서 받은 액세스 토큰
}