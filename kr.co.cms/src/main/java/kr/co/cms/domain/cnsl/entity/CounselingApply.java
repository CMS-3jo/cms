package kr.co.cms.domain.cnsl.entity;

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

@Entity
@Table(name = "CNSL_APLY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingApply {

    @Id
    @Column(name = "CNSL_APLY_ID")
    private String cnslAplyId;

    @Column(name = "STD_NO", nullable = false)
    private String stdNo;

    @Column(name = "EMPL_NO")
    private String emplNo; // 상담사 배정 전엔 null

    @Column(name = "APLY_DTTM")
    private LocalDateTime aplyDttm;

    @Column(name = "REQ_DTTM")
    private LocalDateTime reqDttm;

    @Column(name = "TYPE_CD")
    private String typeCd;

    @Column(name = "STAT_CD")
    private String statCd;

    @Column(name = "APPLY_EMAIL")
    private String applyEmail;

    @Lob 
    @Column(name = "APPLY_CONTENT")
    private String applyContent;
}