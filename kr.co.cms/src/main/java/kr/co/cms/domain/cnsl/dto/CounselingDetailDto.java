package kr.co.cms.domain.cnsl.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingDetailDto {

    private String cnslAplyId;
    private String stdNo;
    private String stdNm;
    private String emplNo;
    private String emplNm;
    private String typeCd;
    private String statCd;
    private LocalDateTime reqDttm;
    private String applyContent;

    private String phone;
    private String email;
    
    private String deptCd;
    private String deptNm;
}
