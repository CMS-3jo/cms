package kr.co.cms.domain.noncur.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    
    @Column(name = "PRG_STAT_CD", length = 2)
    private String prgStatCd;
    
    @Transient
    @Setter
    private String deptName; // 부서명
    
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
