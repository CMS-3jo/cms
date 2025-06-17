package kr.co.cms.domain.cca.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "CORE_CPT_INFO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoreCptInfo {

    @Id
    @Column(name = "CCI_ID", length = 20)
    private String cciId;

    @ManyToOne
    @JoinColumn(name = "UP_CCI_ID")
    private CoreCptInfo parentCpt;

    @Column(name = "CCI_NM", length = 100)
    private String cciNm;

    @Column(name = "CCI_DESC", length = 500)
    private String cciDesc;

    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @Column(name = "UPD_USER_ID", length = 20)
    private String updUserId;

    @Column(name = "UPD_DT")
    private LocalDateTime updDt;

    @Column(name = "CATEGORY_CD", length = 50)
    private String categoryCd;

    @Column(name = "VISIBLE_YN", length = 1)
    private String visibleYn;

    @Column(name = "AVAIL_START_DT")
    private LocalDate availStartDt;

    @Column(name = "AVAIL_END_DT")
    private LocalDate availEndDt;
}