package kr.co.cms.domain.mileage.entity;

import java.math.BigDecimal;
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
@Table(name = "STD_MILEAGE_HIST")
@Getter
@Setter
@NoArgsConstructor
public class StudentMileageHistory {
    
    @Id
    @Column(name = "MLG_ID", length = 20)
    private String mlgId;
    
    @Column(name = "PRG_ID", length = 20, nullable = false)
    private String prgId;
    
    @Column(name = "STD_NO", length = 20, nullable = false)
    private String stdNo;
    
    @Column(name = "CMP_ID", length = 20, nullable = false)
    private String cmpId;
    
    @Column(name = "MLG_SCORE", precision = 10, scale = 3)
    private BigDecimal mlgScore;
    
    @Column(name = "MLG_DT")
    private LocalDateTime mlgDt;
    
    @Column(name = "MLG_ADD_CD", length = 10)
    private String mlgAddCd;
    
    @PrePersist
    protected void onCreate() {
        mlgDt = LocalDateTime.now();
    }
    
    public StudentMileageHistory(String mlgId, String prgId, String stdNo, String cmpId, 
                               BigDecimal mlgScore, String mlgAddCd) {
        this.mlgId = mlgId;
        this.prgId = prgId;
        this.stdNo = stdNo;
        this.cmpId = cmpId;
        this.mlgScore = mlgScore;
        this.mlgAddCd = mlgAddCd;
    }
}