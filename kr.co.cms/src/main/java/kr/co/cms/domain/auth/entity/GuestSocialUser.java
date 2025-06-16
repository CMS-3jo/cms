package kr.co.cms.domain.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GUEST_SOCIAL_USER")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSocialUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GUEST_ID")
    private Integer guestId;
    
    @Column(name = "PROVIDER", nullable = false, length = 50)
    private String provider;  // GOOGLE, KAKAO, NAVER
    
    @Column(name = "PROVIDER_ID", nullable = false, length = 255)
    private String providerId;  // 소셜 서비스 고유 ID
    
    @Column(name = "EMAIL", length = 255)
    private String email;
    
    @Column(name = "DISPLAY_NAME", length = 100)
    private String displayName;
    
    @Column(name = "PROFILE_IMAGE_URL", length = 500)
    private String profileImageUrl;
    
    @Column(name = "LAST_LOGIN_DATE")
    private LocalDateTime lastLoginDate;
    
    @Column(name = "CREATED_DATE", nullable = false)
    private LocalDateTime createdDate;
    
    @Column(name = "ACCOUNT_STATUS", length = 10)
    @Builder.Default
    private String accountStatus = "ACTIVE";  // ACTIVE, INACTIVE
    
    
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (accountStatus == null) {
            accountStatus = "ACTIVE";
        }
    }
    
    // OAuthService 호환성을 위한 메서드들
    
    /**
     * getName() - displayName을 name으로 반환
     */
    public String getName() {
        return this.displayName;
    }
    
    /**
     * setName() - displayName 설정
     */
    public void setName(String name) {
        this.displayName = name;
    }
    
    /**
     * 업데이트 시간 설정 (실제 DB 컬럼은 없지만 로직에서 사용)
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        // 실제로는 lastLoginDate를 업데이트
        this.lastLoginDate = updatedAt;
    }
    
    /**
     * 업데이트 시간 조회
     */
    public LocalDateTime getUpdatedAt() {
        return this.lastLoginDate;
    }
    
    /**
     * nickname 조회 (displayName 반환)
     */
    public String getNickname() {
        return this.displayName;
    }
    
    /**
     * nickname 설정 (displayName 설정)
     */
    public void setNickname(String nickname) {
        this.displayName = nickname;
    }
    
    /**
     * 마지막 로그인 시간 업데이트
     */
    public void updateLastLoginAt() {
        this.lastLoginDate = LocalDateTime.now();
    }
    
    /**
     * 계정이 활성 상태인지 확인
     */
    public boolean isActive() {
        return "ACTIVE".equals(this.accountStatus);
    }
    
    // OAuthService에서 사용하는 createdAt 필드 호환성을 위한 getter/setter
    public LocalDateTime getCreatedAt() {
        return this.createdDate;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdDate = createdAt;
    }
}