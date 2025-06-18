package kr.co.cms.domain.mileage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProgramMileageDTO {
    private String prgId;
    private String prgNm;
    private BigDecimal mlgScore;
    private String regUserId;
    private LocalDateTime regDt;
}