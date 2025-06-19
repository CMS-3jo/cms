package kr.co.cms.domain.noncur.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

//view용
@Data
public class NoncurDetailDTO {
    private String prgId;
    private String prgNm;
    private String prgDesc;
    private LocalDateTime prgStDt;
    private LocalDateTime prgEndDt;
    private String prgDeptCd;
    private String deptName;
    private Integer maxCnt;
    private String regUserId;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private String prgStatCd;
    private String prgStatNm;
    private long dDay;
    
    // 핵심역량 관련
    private List<CompetencyDTO> competencies; // 해당 프로그램의 핵심역량들
    private List<CompetencyDTO> allCompetencies; // 모든 핵심역량 (UI에서 활용)
    
    // 추가 정보
    private String location; // 장소
    private String contactEmail; // 연락처 이메일
    private String contactPhone; // 연락처 전화번호
    private String targetInfo; // 대상 정보
    private String departmentInfo; // 학과 정보
    private String gradeInfo; // 학년 정보
    private int currentApplicants; // 현재 신청자 수
    private List<String> attachments; // 첨부파일 목록
    private String programSchedule; // 프로그램 일정
    
    @Data
    public static class CompetencyDTO {
        private String cciId;
        private String cciNm;
        private String cciDesc;
        private boolean isSelected; // 해당 프로그램에 포함되는지 여부
    }
}