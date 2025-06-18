package kr.co.cms.domain.cca.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CcaStudentResultDto {
    private String stdNo;
    private String stdNm;
    private String deptCd;
    private LocalDateTime latestDate;
    private List<CcaCompScoreDto> scores;

    public String getStdNo() {
        return stdNo;
    }

    public void setStdNo(String stdNo) {
        this.stdNo = stdNo;
    }

    public String getStdNm() {
        return stdNm;
    }

    public void setStdNm(String stdNm) {
        this.stdNm = stdNm;
    }

    public String getDeptCd() {
        return deptCd;
    }

    public void setDeptCd(String deptCd) {
        this.deptCd = deptCd;
    }

    public LocalDateTime getLatestDate() {
        return latestDate;
    }

    public void setLatestDate(LocalDateTime latestDate) {
        this.latestDate = latestDate;
    }

    public List<CcaCompScoreDto> getScores() {
        return scores;
    }

    public void setScores(List<CcaCompScoreDto> scores) {
        this.scores = scores;
    }
}