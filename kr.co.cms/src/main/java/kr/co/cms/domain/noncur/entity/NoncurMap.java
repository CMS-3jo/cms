package kr.co.cms.domain.noncur.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "PRG_CCI_MAP")
@IdClass(NoncurMapId.class)
@Getter
@NoArgsConstructor
public class NoncurMap {
    
    @Id
    @Column(name = "PRG_ID", length = 20)
    private String prgId;
    
    @Id
    @Column(name = "CCI_ID", length = 20)
    private String cciId;
    
    @Column(name = "REG_DT")
    private LocalDateTime regDt;
    
    @PrePersist
    protected void onCreate() {
        regDt = LocalDateTime.now();
    }
    
    public NoncurMap(String prgId, String cciId) {
        this.prgId = prgId;
        this.cciId = cciId;
    }
}