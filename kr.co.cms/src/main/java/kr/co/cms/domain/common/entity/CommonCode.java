package kr.co.cms.domain.common.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;


@Entity
@Table(name = "COMMON_CODE")
@Data
public class CommonCode {
    @Id
    @Column(name = "CODE_ID")
    private Long codeId;

    @Column(name = "GRP_CD")
    private String groupCode;

    @Column(name = "CD")
    private String code;

    @Column(name = "CD_NM")
    private String name;

    @Column(name = "CD_DESC")
    private String description;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;
}
