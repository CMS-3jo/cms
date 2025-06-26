package kr.co.cms.domain.mypage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "EMPL_INFO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmplInfo {
    
    @Id
    @Column(name = "EMPL_NO")
    private String emplNo; // 사번
    
    @Column(name = "EMPL_NM", nullable = false)
    private String emplNm; // 교직원명
    
    @Column(name = "DEPT_CD", nullable = false)
    private String deptCd; // 학과코드
    
    @Column(name = "STD_STAT_CD")
    private String stdStatCd; // 상태코드
    
    @Column(name = "POSTAL_CODE")
    private String postalCode; // 우편번호
    
    @Column(name = "ADDRESS")
    private String address; // 주소
    
    @Column(name = "DETAIL_ADDRESS")
    private String detailAddress; // 상세주소
    
    @Column(name = "PHONE_NUMBER")
    private String phoneNumber; // 연락처
    
    @Column(name = "EMAIL")
    private String email; // 이메일
    
    @Column(name = "USER_ID")
    private String userId; // 사용자ID
    
    @Column(name = "PROFILE_IMAGE_ID")
    private Integer profileImageId; // 이미지id
}