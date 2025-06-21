package kr.co.cms.domain.noncur.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

//비교과 등록용
@Data
public class NoncurRegisterDTO {
    private String prgId; // 생성될 ID
    
    @NotBlank(message = "프로그램명은 필수입니다.")
    private String prgNm;
    
    @NotBlank(message = "프로그램 설명은 필수입니다.")
    private String prgDesc;
    
    @NotNull(message = "시작일은 필수입니다.")
    private LocalDateTime prgStDt;
    
    @NotNull(message = "종료일은 필수입니다.")
    private LocalDateTime prgEndDt;
    
    @NotBlank(message = "운영부서는 필수입니다.")
    private String prgDeptCd;
    
    @Min(value = 1, message = "정원은 1명 이상이어야 합니다.")
    private Integer maxCnt;
    
    private String prgStatCd = "01"; // 기본값: 모집중
    
    // 추가 정보
    private String location;
    private String contactEmail;
    private String contactPhone;
    private String targetInfo;
    private String departmentInfo;
    private String gradeInfo;
    private String programSchedule;
    
    // 관련 데이터
    private List<String> selectedCompetencies; // 선택된 핵심역량 ID들
    private String regUserId;
    
    //마일리지
    @Min(value = 0, message = "마일리지는 0점 이상이어야 합니다.")
    private BigDecimal mlgScore;
}
