package kr.co.cms.domain.cnsl.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingApplyRequest {
    private String stdNo;
    private String typeCd;
    private String statCd;
    private String applyDate;   // yyyy-MM-dd
    private String applyTime;   // HH:mm:ss
    private String applyEmail;
    private String applyContent;
}
