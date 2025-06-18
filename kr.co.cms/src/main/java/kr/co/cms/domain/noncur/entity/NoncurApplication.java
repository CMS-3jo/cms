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
@Table(name = "NCS_PRG_APLY")
@Getter
@Setter
@NoArgsConstructor
public class NoncurApplication {
	 @Id
	    @Column(name = "APLY_ID", length = 20)
	    private String aplyId;
	    
	    @Column(name = "PRG_ID", length = 20, nullable = false)
	    private String prgId;
	    
	    @Column(name = "STD_NO", length = 20, nullable = false)
	    private String stdNo;
	    
	    @Column(name = "APLY_SEL_CD", length = 10)
	    private String aplySelCd;
	    
	    @Column(name = "APLY_DT")
	    private LocalDateTime aplyDt;
	    
	    @Column(name = "APLY_STAT_CD", length = 10)
	    private String aplyStatCd;
	    
	    @PrePersist
	    protected void onCreate() {
	        aplyDt = LocalDateTime.now();
	        if (aplyStatCd == null) {
	            aplyStatCd = "01"; // 기본값: 신청완료
	        }
	    }
	    
	    public NoncurApplication(String aplyId, String prgId, String stdNo, String aplySelCd) {
	        this.aplyId = aplyId;
	        this.prgId = prgId;
	        this.stdNo = stdNo;
	        this.aplySelCd = aplySelCd;
	    }

}
