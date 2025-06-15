package kr.co.cms.domain.mypage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//프로필 수정 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String phoneNumber;         // 연락처
    private String email;               // 이메일
    private String postalCode;          // 우편번호
    private String address;             // 주소
    private String detailAddress;       // 상세주소
}