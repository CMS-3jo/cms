package kr.co.cms.domain.mileage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class MileageHistoryDTO {
    private String mlgId;
    private String prgId;
    private String prgNm; // 프로그램명 (조인으로 조회)
    private String stdNo;
    private String cmpId;
    private BigDecimal mlgScore;
    private LocalDateTime mlgDt;
    private String mlgAddCd;
    private String mlgAddNm; // 가감구분명
    private String activityType; // 활동유형 (비교과, 동아리 등)
}