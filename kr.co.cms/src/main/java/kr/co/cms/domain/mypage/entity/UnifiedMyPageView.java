package kr.co.cms.domain.mypage.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 통합 마이페이지 뷰 Entity
@Entity
@Table(name = "UNIFIED_MYPAGE_VIEW")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnifiedMyPageView {
    
    @Id
    @Column(name = "USER_ID")
    private String userId;
    
    @Column(name = "USER_TYPE")
    private String userType;
    
    @Column(name = "IDENTIFIER_NO")
    private String identifierNo;
    
    @Column(name = "USER_NAME")
    private String userName;
    
    @Column(name = "DEPT_CD")
    private String deptCode;
    
    @Column(name = "DEPT_NM")
    private String deptName;
    
    @Column(name = "GRADE_YEAR")
    private Integer gradeYear;
    
    @Column(name = "ENTER_DATE")
    private LocalDateTime enterDate;
    
    @Column(name = "STATUS_CODE")
    private String statusCode;
    
    @Column(name = "POSTAL_CODE")
    private String postalCode;
    
    @Column(name = "ADDRESS")
    private String address;
    
    @Column(name = "DETAIL_ADDRESS")
    private String detailAddress;
    
    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;
    
    @Column(name = "EMAIL")
    private String email;
    
    @Column(name = "ACCOUNT_STATUS")
    private String accountStatus;
    
    @Column(name = "ACCOUNT_CREATED_DATE")
    private LocalDateTime accountCreatedDate;
    
    @Column(name = "PROVIDER")
    private String provider;
    
    @Column(name = "PROFILE_IMAGE_URL")
    private String profileImageUrl;
    
    @Column(name = "LAST_LOGIN_DATE")
    private LocalDateTime lastLoginDate;
}