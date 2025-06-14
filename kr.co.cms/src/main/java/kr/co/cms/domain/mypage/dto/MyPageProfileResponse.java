package kr.co.cms.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// 마이페이지 프로필 응답 DTO
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPageProfileResponse {
    private String userId;              // 로그인 ID
    private String userType;            // STUDENT, COUNSELOR, PROFESSOR, ADMIN, GUEST
    private String identifierNo;        // 학번 또는 사번
    private String userName;            // 사용자 이름
    private String deptCode;            // 학과 코드
    private String deptName;            // 학과명
    private Integer gradeYear;          // 학년 (학생만)
    private LocalDateTime enterDate;    // 입학일 (학생만)
    private String statusCode;          // 상태 코드
    private String postalCode;          // 우편번호
    private String address;             // 주소
    private String detailAddress;       // 상세주소
    private String phoneNumber;         // 연락처
    private String email;               // 이메일
    private String accountStatus;       // 계정 상태
    private LocalDateTime accountCreatedDate; // 계정 생성일
    
    // 게스트 전용 필드
    private String provider;            // 소셜 로그인 제공업체
    private String profileImageUrl;     // 프로필 이미지 URL
    private LocalDateTime lastLoginDate; // 마지막 로그인
}
