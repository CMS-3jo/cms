package kr.co.cms.domain.cca.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "CORE_CPT_EVAL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoreCptEval {

    @Id
    @Column(name = "EVAL_ID", length = 20)
    private String evalId;

    @Column(name = "STD_NO", length = 20)
    private String stdNo;

    /**
     * QST_ID 컬럼은 외래키용으로만 사용하므로 insertable=false, updatable=false
     * 실제 연관관계 필드는 아래 coreCptQst
     */
    @Column(name = "QST_ID", length = 20, insertable = false, updatable = false)
    private String qstId;

    @Column(name = "ANS_SCORE", precision = 10, scale = 3)
    private BigDecimal ansScore;

    @Column(name = "ANS_DT")
    private LocalDateTime ansDt;

    /**
     * CoreCptQst 와의 다대일 연관관계 매핑
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QST_ID", nullable = false)
    private CoreCptQst question;    //<— 이 이름이 mappedBy="question" 과 일치해야 합니다.

}
