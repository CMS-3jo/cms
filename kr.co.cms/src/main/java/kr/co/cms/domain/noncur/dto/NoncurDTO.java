package kr.co.cms.domain.noncur.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

//리스트출력용
@Data
public class NoncurDTO {
    private String prgId;
    private String prgNm;
    private String prgDesc;
    private LocalDateTime prgStDt;
    private LocalDateTime prgEndDt;
    private String prgDeptCd; //부서코드
    private List<String> cciIds; // 핵심역량 ID 리스트
    private Integer maxCnt;
    private String regUserId;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String prgStatCd; // 상태코드 (01, 02, 03, 04, 05)
    private String prgStatNm; // 상태명 (모집중, 마감임박, 모집완료, 운영중, 종료)
    private long dDay; // D-day 계산
    private String deptName; // 부서명
    
}
