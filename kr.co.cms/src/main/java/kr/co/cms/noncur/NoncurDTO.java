package kr.co.cms.noncur;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class NoncurDTO {
    private String prgId;
    private String prgNm;
    private String prgDesc;
    private LocalDateTime prgStDt;
    private LocalDateTime prgEndDt;
    private String prgDeptCd; //부서코드
    private String cciId;
    private Integer maxCnt;
    private String regUserId;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private NoncurEnum.Status status;
    public String getStatusText() { 
    	return status.getDescription();
    }

    private long dDay; // D-day 계산
    private String deptName; // 부서명
}
