package kr.co.cms.domain.cnsl.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CounselingScheduleCreateRequest {
    private String cnslAplyId;
    private String stdNo;
    private String emplNo;
    private LocalDateTime cnslDt;
}
