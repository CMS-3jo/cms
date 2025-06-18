package kr.co.cms.domain.cca.dto;

public class CcaCompScoreDto {
    private String competency;  // 예: "의사소통", "문제해결" 등
    private double score;       // 0.0 ~ 100.0

    public CcaCompScoreDto() {}

    public CcaCompScoreDto(String competency, double score) {
        this.competency = competency;
        this.score = score;
    }

    public String getCompetency() {
        return competency;
    }

    public void setCompetency(String competency) {
        this.competency = competency;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}
