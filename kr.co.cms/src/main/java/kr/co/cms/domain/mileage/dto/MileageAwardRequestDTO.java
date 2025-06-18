package kr.co.cms.domain.mileage.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MileageAwardRequestDTO {
    private String prgId;
    private String stdNo;
    private String cmpId;
    private BigDecimal mlgScore;
    private String mlgAddCd;
    private String regUserId;
}
