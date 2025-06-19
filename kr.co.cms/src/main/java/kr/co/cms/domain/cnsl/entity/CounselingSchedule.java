package kr.co.cms.domain.cnsl.entity;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "CNSL_SCHD")
@NoArgsConstructor
@AllArgsConstructor
public class CounselingSchedule {

    @Id
    @Column(name = "SCHD_ID")
    private String schdId;

    @Column(name = "EMPL_NO")
    private String emplNo;

    @Column(name = "DAY_CD")
    private String dayCd;

    @Column(name = "ST_TM")
    private LocalTime startTime;

    @Column(name = "END_TM")
    private LocalTime endTime;
}