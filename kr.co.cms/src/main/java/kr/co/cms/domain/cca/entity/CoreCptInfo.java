package kr.co.cms.domain.cca.entity;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CORE_CPT_INFO")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CoreCptInfo {

    @Id
    @Column(name = "CCI_ID", length = 20)
    private String cciId;

    @Column(name = "CCI_NM", length = 100)
    private String cciNm;

    @Column(name = "CCI_DESC")
    private String cciDesc;

    @Column(name = "CATEGORY_CD")
    private String categoryCd;

    @Column(name = "REG_USER_ID")
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @Column(name = "VISIBLE_YN", length = 1)
    private String visibleYn;

    @OneToMany(mappedBy = "coreCptInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CoreCptQst> questions;
}
