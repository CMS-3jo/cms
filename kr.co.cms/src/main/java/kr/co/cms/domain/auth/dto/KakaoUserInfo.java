package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//카카오 사용자 정보 응답
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KakaoUserInfo {
 private Long id;                // 카카오 고유 ID
 private KakaoAccount kakao_account;
 
 @Data
 @NoArgsConstructor
 @AllArgsConstructor
 public static class KakaoAccount {
     private String email;
     private Profile profile;
     
     @Data
     @NoArgsConstructor
     @AllArgsConstructor
     public static class Profile {
         private String nickname;
         private String profile_image_url;
     }
 }
}