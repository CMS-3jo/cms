package kr.co.cms.domain.cca.dto;

import java.util.List;

import lombok.Data;

@Data
public class CoreCptEvalRequestDto {
    private String stdNo;
    private String cciId;
    private List<AnswerDto> answers;

    @Data
    public static class AnswerDto {
        private String qstId;
        private int score;
    }
}