package kr.co.cms.domain.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "GUEST_REFRESH_TOKEN")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestRefreshToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TOKEN_ID")
    private Integer tokenId;
    
    @Column(name = "GUEST_ID", nullable = false)
    private Integer guestId;
    
    @Column(name = "REFRESH_TOKEN", nullable = false, length = 500)
    private String refreshToken;
    
    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "CREATED_AT")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // 게스트 사용자와의 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GUEST_ID", insertable = false, updatable = false)
    private GuestSocialUser guestSocialUser;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    /**
     * 토큰이 만료되었는지 확인
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    /**
     * 토큰 만료 시간 연장
     */
    public void extendExpiry(int days) {
        this.expiresAt = LocalDateTime.now().plusDays(days);
    }
}