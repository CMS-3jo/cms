// CreateRegisteredUserRequest.java
package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRegisteredUserRequest {
    // 기본 계정 정보
    private String userId;
    private String password;
    private String roleType; // STUDENT, COUNSELOR, PROFESSOR, ADMIN
    
    // 공통 개인정보
    private String name;
    private String deptCode;
    private String phoneNumber;
    private String email;
    private String postalCode;
    private String address;
    private String detailAddress;
    
    // 학생 전용 필드
    private String studentNo;    // 학번 (학생만)
    private Integer gradeYear;   // 학년 (학생만)
    private LocalDateTime enterDate; // 입학일 (학생만)
    
    // 교직원 전용 필드
    private String employeeNo;   // 사번 (교직원만)
    
    // 상태코드 (선택)
    private String statusCode;
}