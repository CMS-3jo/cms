package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//구글 사용자 정보 응답
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
 private String id;              // 구글 고유 ID
 private String email;           // 이메일
 private String name;            // 이름
 private String picture;         // 프로필 이미지
 private String given_name;      // 이름
 private String family_name;     // 성
 private boolean verified_email; // 이메일 인증 여부
}