package kr.co.cms.domain.cca.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CORE_CPT_QST")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CoreCptQst {

    @Id
    @Column(name = "QST_ID", length = 20)
    private String qstId;

    @Column(name = "QST_CONT", length = 500)
    private String qstCont;
    /**
     * 문항별 핵심역량 코드
     */
    @Column(name = "CATEGORY_CD", length = 20, nullable = false)
    private String categoryCd;
    
    @Column(name = "QST_ORD")
    private Integer qstOrd;

    @Column(name = "REG_USER_ID", length = 50)
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CCI_ID", nullable = false)
    private CoreCptInfo coreCptInfo;

    // ★ 평가(CoreCptEval)와의 양방향 매핑 추가
    @OneToMany(
        mappedBy = "question",
        cascade = CascadeType.REMOVE,
        orphanRemoval = true
    )
    private List<CoreCptEval> evals = new ArrayList<>();
}
