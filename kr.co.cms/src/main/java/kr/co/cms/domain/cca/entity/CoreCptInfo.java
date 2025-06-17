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
    @Column(name = "CCI_ID", length = 36)
    private String cciId;

    @Column(name = "CCI_NM", length = 200, nullable = false)
    private String cciNm;            // 설문 제목

    @Column(name = "CATEGORY_CD", length = 20, nullable = false)
    private String categoryCd;       // 학과 코드

    @Column(name = "CCI_DESC", length = 500)
    private String cciDesc;          // 상세 설명 (옵션)

    @Column(name = "REG_USER_ID", length = 50, nullable = false)
    private String regUserId;        // 작성자

    @Column(name = "REG_DT", nullable = false)
    private LocalDateTime regDt;     // 등록일

    @Column(name = "VISIBLE_YN", length = 1, nullable = false)
    private String visibleYn;        // Y/N 플래그

    @OneToMany(mappedBy = "coreCptInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CoreCptQst> questions;

}
