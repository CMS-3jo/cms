package kr.co.cms.domain.mileage.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "NCS_PRG_MILEAGE")
@Getter
@Setter
@NoArgsConstructor
public class ProgramMileage {
    
    @Id
    @Column(name = "PRG_ID", length = 20)
    private String prgId;
    
    @Column(name = "MLG_SCORE", precision = 10, scale = 3)
    private BigDecimal mlgScore;
    
    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;
    
    @Column(name = "REG_DT")
    private LocalDateTime regDt;
    
    @Column(name = "UPD_USER_ID", length = 20)
    private String updUserId;
    
    @Column(name = "UPD_DT")
    private LocalDateTime updDt;
    
    @PrePersist
    protected void onCreate() {
        regDt = LocalDateTime.now();
        updDt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updDt = LocalDateTime.now();
    }
    
    public ProgramMileage(String prgId, BigDecimal mlgScore, String regUserId) {
        this.prgId = prgId;
        this.mlgScore = mlgScore;
        this.regUserId = regUserId;
    }
}