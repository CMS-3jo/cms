package kr.co.cms.domain.mileage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class StudentMileageDTO {
    private String stdNo;
    private String stdNm; // 학생명
    private BigDecimal totalMileage;
    private LocalDateTime lastUpdatedAt;
    private List<MileageHistoryDTO> recentHistory;
}