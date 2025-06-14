package kr.co.cms.domain.auth.entity;

import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "REFRESH_TOKEN")
@Data
public class RefreshToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TOKEN_ID")
    private Long tokenId;
    
    @Column(name = "USER_ID")
    private String userId;
    
    @Column(name = "REFRESH_TOKEN")
    private String refreshToken;
    
    @Column(name = "EXPIRES_AT")
    private LocalDateTime expiresAt;
    
    @CreationTimestamp
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}