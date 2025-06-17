package kr.co.cms.domain.cca.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    @Column(name = "QST_ID", length = 20)
    private String qstId;

    @Column(name = "ANS_SCORE", precision = 10, scale = 3)
    private BigDecimal ansScore;

    @Column(name = "ANS_DT")
    private LocalDateTime ansDt;
}
