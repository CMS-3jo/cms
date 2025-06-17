package kr.co.cms.domain.noncur.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class NoncurApplicationRequestDTO {
    @NotBlank(message = "프로그램 ID는 필수입니다.")
    private String prgId;
    
    @NotBlank(message = "학번은 필수입니다.")
    private String stdNo;
    
    private String aplySelCd = "01"; // 기본값: 일반신청
    
    // 추가 신청 정보 (필요시)
    private String motivation; // 지원동기
    private String expectation; // 기대효과
}
