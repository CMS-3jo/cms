package kr.co.cms.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//간단한 응답 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimpleResponse {
 private boolean success;
 private String message;
 private Object data;
 
 public static SimpleResponse success(String message) {
     return SimpleResponse.builder()
             .success(true)
             .message(message)
             .build();
 }
 
 public static SimpleResponse success(String message, Object data) {
     return SimpleResponse.builder()
             .success(true)
             .message(message)
             .data(data)
             .build();
 }
 
 public static SimpleResponse error(String message) {
     return SimpleResponse.builder()
             .success(false)
             .message(message)
             .build();
 }
}