package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//소셜 사용자 정보 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialUserInfo {
 private String providerId;      // 소셜 서비스 고유 ID
 private String provider;        // 제공업체 ("GOOGLE", "KAKAO", "NAVER")
 private String email;           // 이메일
 private String name;            // 이름
 private String profileImageUrl; // 프로필 이미지 URL
 private String nickname;        // 닉네임
}
