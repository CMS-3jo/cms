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

@Entity
@Table(name = "STD_INFO")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StdInfo {
    
    @Id
    @Column(name = "STD_NO")
    private String stdNo; // 학번
    
    @Column(name = "STD_NM", nullable = false)
    private String stdNm; // 학생명
    
    @Column(name = "DEPT_CD", nullable = false)
    private String deptCd; // 학과코드
    
    @Column(name = "SCH_YR")
    private Integer schYr; // 학년
    
    @Column(name = "ENTR_DT")
    private LocalDateTime entrDt; // 입학일자
    
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
}