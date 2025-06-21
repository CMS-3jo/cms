package kr.co.cms.domain.noncur.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "NCS_CMP_INFO")
@Getter
@Setter
@NoArgsConstructor
public class NcsCompletionInfo {
    
    @Id
    @Column(name = "CMP_ID", length = 20)
    private String cmpId; // 이수ID PK
    
    @Column(name = "APLY_ID", length = 20, nullable = false)
    private String aplyId; // 신청ID FK
    
    @Column(name = "PRG_ID", length = 20, nullable = false)
    private String prgId; // 프로그램ID FK
    
    @Column(name = "STD_NO", length = 20, nullable = false)
    private String stdNo; // 학번 FK
    
    @Column(name = "CMP_DT")
    private LocalDateTime cmpDt; // 이수일자
    
    @Column(name = "CMP_STAT_CD", length = 10)
    private String cmpStatCd; // 이수결과코드
    
    @PrePersist
    protected void onCreate() {
        if (cmpDt == null) {
            cmpDt = LocalDateTime.now();
        }
        if (cmpStatCd == null) {
            cmpStatCd = "01"; // 기본값: 이수완료
        }
    }
    
    public NcsCompletionInfo(String cmpId, String aplyId, String prgId, String stdNo) {
        this.cmpId = cmpId;
        this.aplyId = aplyId;
        this.prgId = prgId;
        this.stdNo = stdNo;
    }
}