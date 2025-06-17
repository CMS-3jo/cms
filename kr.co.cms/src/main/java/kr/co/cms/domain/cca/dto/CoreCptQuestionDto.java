package kr.co.cms.domain.cca.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoreCptQuestionDto {
    private String qstId;
    private String qstCont;
    private Integer qstOrd;
}