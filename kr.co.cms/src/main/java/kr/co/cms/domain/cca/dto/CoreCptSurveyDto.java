package kr.co.cms.domain.cca.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CoreCptSurveyDto {
    private String title;       // 설문 제목  CCI_NM
    private String ccaId;       // 역량 분류  CATEGORY_CD
    private String regUserId;   // 등록자 ID  REG_USER_ID
    private List<QuestionDto> questions;

    @Getter
    @Setter
    public static class QuestionDto {
        private int order;      // 문항 순서  QST_ORD
        private String content; // 문항 내용  QST_CONT
    }
}