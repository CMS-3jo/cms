package kr.co.cms.domain.noncur.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 신청 상세 정보 DTO (관리자용)
 */
@Data
public class NoncurApplicationDetailDTO {
    private String aplyId;
    private String prgId;
    private String prgNm; // 프로그램명
    private String stdNo;
    private String stdNm; // 학생명
    private String stdDeptNm; // 학생 소속학과
    private String stdGrade; // 학년
    private String stdPhone; // 연락처
    private String stdEmail; // 이메일
    private String aplySelCd;
    private String aplySelNm; // 신청구분명
    private LocalDateTime aplyDt;
    private String aplyStatCd;
    private String aplyStatNm; // 상태명
    private String rejectReason; // 거부사유
    private String motivation; // 지원동기
    private String expectation; // 기대효과
    private LocalDateTime completeDt; // 이수완료일시
    private BigDecimal awardedMileage; // 부여된 마일리지
}