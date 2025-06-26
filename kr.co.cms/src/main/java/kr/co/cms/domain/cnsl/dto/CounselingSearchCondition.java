package kr.co.cms.domain.cnsl.dto;

import lombok.Data;

@Data
public class CounselingSearchCondition {
    private String search;     // 이름
    private String status;     // 상담 상태 (STAT_CD)
    private String counselorId;
}
