package kr.co.cms.domain.noncur.dto;

import java.time.LocalDateTime;

import lombok.Data;

//비교과 신청관련
@Data
public class NoncurApplicationDTO {
    private String aplyId;
    private String prgId;
    private String stdNo;
    private String aplySelCd;
    private LocalDateTime aplyDt;
    private String aplyStatCd;
    private String aplyStatNm; // 상태명
    
    // 추가 정보 (JOIN으로 조회 시)
    private String prgNm; // 프로그램명
    private String stdNm; // 학생명
}

