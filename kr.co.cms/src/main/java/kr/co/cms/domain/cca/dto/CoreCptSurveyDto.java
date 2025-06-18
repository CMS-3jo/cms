package kr.co.cms.domain.cca.dto;

import java.util.List;

import lombok.Data;

//CoreCptSurveyDto.java

@Data
public class CoreCptSurveyDto {
 private String title;       // CCI_NM
 private String ccaId;       // CATEGORY_CD
 private String regUserId;   // REG_USER_ID
 private List<QuestionDto> questions;

 @Data
 public static class QuestionDto {
     private int order;       // QST_ORD
     private String content;  // QST_CONT
     private String competency; // << 이 필드 추가
 }
}
