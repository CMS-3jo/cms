package kr.co.cms.domain.auth.entity;

import lombok.Data;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;

@Entity
@Table(name = "USER_ACCOUNT")
@Data
public class User {
    
    @Id
    @Column(name = "USER_ID")
    private String userId;
    
    @Column(name = "USER_PW")
    private String password;
    
    @Column(name = "ACCOUNT_STATUS")
    private String status = "ACTIVE";
    
    @CreationTimestamp
    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

}