package kr.co.cms.domain.cca.dto;

import java.util.List;

public class CcaScoreSummaryDto {
    private List<CcaCompScoreDto> studentScores;
    private List<CcaCompScoreDto> deptAvgScores;
    private List<CcaCompScoreDto> overallAvgScores;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> recommendations;

    public List<CcaCompScoreDto> getStudentScores() { return studentScores; }
    public void setStudentScores(List<CcaCompScoreDto> studentScores) { this.studentScores = studentScores; }
    public List<CcaCompScoreDto> getDeptAvgScores() { return deptAvgScores; }
    public void setDeptAvgScores(List<CcaCompScoreDto> deptAvgScores) { this.deptAvgScores = deptAvgScores; }
    public List<CcaCompScoreDto> getOverallAvgScores() { return overallAvgScores; }
    public void setOverallAvgScores(List<CcaCompScoreDto> overallAvgScores) { this.overallAvgScores = overallAvgScores; }
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    public List<String> getWeaknesses() { return weaknesses; }
    public void setWeaknesses(List<String> weaknesses) { this.weaknesses = weaknesses; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
