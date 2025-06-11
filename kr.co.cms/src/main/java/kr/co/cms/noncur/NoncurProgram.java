package kr.co.cms.noncur;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "NCS_PRG_INFO")
@Getter
@NoArgsConstructor
public class NoncurProgram {
	
    @Id
    @Column(name = "PRG_ID", length = 20)
    private String prgId;
    
    @Column(name = "PRG_NM", length = 100)
    private String prgNm;
    
    @Column(name = "PRG_DESC", length = 1000)
    private String prgDesc;
    
    @Column(name = "PRG_ST_DT")
    private LocalDateTime prgStDt;
    
    @Column(name = "PRG_END_DT")
    private LocalDateTime prgEndDt;
    
    @Column(name = "PRG_DEPT_CD", length = 20, nullable = false)
    private String prgDeptCd;
    
    @Column(name = "CCI_ID", length = 20, nullable = false)
    private String cciId;
    
    @Column(name = "MAX_CNT")
    private Integer maxCnt;
    
    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;
    
    @Column(name = "REG_DT")
    private LocalDateTime regDt;
    
    @Column(name = "UPD_USER_ID", length = 20)
    private String updUserId;
    
    @Column(name = "UPD_DT")
    private LocalDateTime updDt;
    
    @Column(name = "PRG_STTS_NM")
    private NoncurEnum.Status status;

    
    // JPA에서 자동으로 생성/수정 시간 관리
    @PrePersist
    protected void onCreate() {
        regDt = LocalDateTime.now();
        updDt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updDt = LocalDateTime.now();
    }

}
