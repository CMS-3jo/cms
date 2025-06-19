package kr.co.cms.domain.cnsl.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CounselingRecordDto {
    private String title;
    private String content;
    private String category;
    private String writer;
    private LocalDateTime createdAt; 
}
