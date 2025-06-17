package kr.co.cms.domain.cca.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "CORE_CPT_QST")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoreCptQst {

    @Id
    @Column(name = "QST_ID", length = 20)
    private String qstId;

    @Column(name = "CCI_ID", length = 20, nullable = false)
    private String cciId;

    @Column(name = "QST_CONT", length = 500)
    private String qstCont;

    @Column(name = "QST_ORD")
    private Integer qstOrd;

    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @Column(name = "UPD_USER_ID", length = 20)
    private String updUserId;

    @Column(name = "UPD_DT")
    private LocalDateTime updDt;
}