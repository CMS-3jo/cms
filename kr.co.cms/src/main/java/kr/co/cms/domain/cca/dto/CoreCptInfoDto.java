package kr.co.cms.domain.cca.dto;


import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoreCptInfoDto {
    private String cciId;
    private String upCciId;
    private String cciNm;
    private String cciDesc;
    private String regUserId;
    private LocalDateTime regDt;
    private String categoryCd;
    private String visibleYn;
    private LocalDate availStartDt;
    private LocalDate availEndDt;
}