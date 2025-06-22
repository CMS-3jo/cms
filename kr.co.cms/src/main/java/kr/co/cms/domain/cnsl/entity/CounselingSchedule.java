package kr.co.cms.domain.cnsl.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "CNSL_SCHD")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingSchedule {

    @Id
    @Column(name = "SCHD_ID")
    private String schdId;

    @Column(name = "CNSL_APLY_ID")
    private String cnslAplyId;

    @Column(name = "STD_NO")
    private String stdNo;

    @Column(name = "EMPL_NO")
    private String emplNo;

    @Column(name = "CNSL_DT")
    private LocalDateTime cnslDt;
}
