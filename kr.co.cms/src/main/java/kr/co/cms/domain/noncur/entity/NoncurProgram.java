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
@Setter
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
    
    @Column(name = "PRG_STAT_CD", length = 10)
    private String prgStatCd;
    
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
    
    // 추가 정보 컬럼들 (테이블에 추가 필요)
    @Column(name = "PRG_LOCATION", length = 200)
    private String prgLocation;
    
    @Column(name = "PRG_CONTACT_EMAIL", length = 100)
    private String prgContactEmail;
    
    @Column(name = "PRG_CONTACT_PHONE", length = 20)
    private String prgContactPhone;
    
    @Column(name = "PRG_TARGET_INFO", length = 500)
    private String prgTargetInfo;
    
    @Column(name = "PRG_DEPT_INFO", length = 200)
    private String prgDeptInfo;
    
    @Column(name = "PRG_GRADE_INFO", length = 100)
    private String prgGradeInfo;
    
    @Column(name = "PRG_SCHEDULE", columnDefinition = "TEXT")
    private String prgSchedule;
    
    @Transient
    @Setter
    private String deptName; // 부서명 (조인으로 조회)
    
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