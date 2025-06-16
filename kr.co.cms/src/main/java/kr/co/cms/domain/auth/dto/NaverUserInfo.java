package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//네이버 사용자 정보 응답
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NaverUserInfo {
 private String resultcode;
 private String message;
 private NaverResponse response;
 
 @Data
 @NoArgsConstructor
 @AllArgsConstructor
 public static class NaverResponse {
     private String id;              // 네이버 고유 ID
     private String email;           // 이메일
     private String name;            // 이름
     private String nickname;        // 닉네임
     private String profile_image;   // 프로필 이미지
     private String age;             // 연령대
     private String gender;          // 성별
 }
}