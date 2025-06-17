package kr.co.cms.domain.cca.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CORE_CPT_QST")
@Getter
@Setter
// JPA가 사용할 기본 생성자
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// Builder가 생성자를 통해 객체를 만들 수 있도록 전체 필드 생성자
@AllArgsConstructor
@Builder
public class CoreCptQst {

    @Id
    @Column(name = "QST_ID", length = 20)
    private String qstId;

    @Column(name = "QST_CONT", length = 500)
    private String qstCont;

    @Column(name = "QST_ORD")
    private Integer qstOrd;

    @Column(name = "REG_USER_ID", length = 50)
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    /** CORE_CPT_INFO 테이블의 CCI_ID 컬럼과 매핑 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CCI_ID", nullable = false)
    private CoreCptInfo coreCptInfo;
}
