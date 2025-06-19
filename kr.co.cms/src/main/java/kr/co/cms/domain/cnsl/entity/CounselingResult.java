package kr.co.cms.domain.cnsl.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "CNSL_RSLT")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingResult {
    @Id
    @Column(name = "CNSL_RSLT_ID")
    private String cnslRsltId;

    @Column(name = "CNSL_APLY_ID")
    private String cnslAplyId;

    @Column(name = "CNSL_DTTM")
    private LocalDateTime cnslDttm;

    @Lob
    @Column(name = "CNSL_CN")
    private String cnslCn;

    @Column(name = "SATISF_SCORE")
    private BigDecimal satisfScore;

    @Column(name = "RSLT_CD")
    private String rsltCd;
}
