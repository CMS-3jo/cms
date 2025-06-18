package kr.co.cms.domain.cnsl.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CounselingListResponse {
	private String cnslAplyId;
    private String status;       // 예: 상담대기
    private String name;         // 학생 이름
    private String studentId;    // 학번
    private String emplNo;
    private String email;
    private String phone;
}