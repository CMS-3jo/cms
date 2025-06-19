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
@Table(name = "STD_MILEAGE_TOTAL")
@Getter
@Setter
@NoArgsConstructor
public class StudentMileageTotal {
    
    @Id
    @Column(name = "STD_NO", length = 20)
    private String stdNo;
    
    @Column(name = "TOT_MLG_SCORE", precision = 10, scale = 3)
    private BigDecimal totMlgScore;
    
    @Column(name = "LAST_UPD_DT")
    private LocalDateTime lastUpdDt;
    
    @PrePersist
    protected void onCreate() {
        lastUpdDt = LocalDateTime.now();
        if (totMlgScore == null) {
            totMlgScore = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdDt = LocalDateTime.now();
    }
    
    public StudentMileageTotal(String stdNo) {
        this.stdNo = stdNo;
        this.totMlgScore = BigDecimal.ZERO;
        this.lastUpdDt = LocalDateTime.now(); // PrePersist가 안 될 수도 있으니 명시적 설정
    }
}