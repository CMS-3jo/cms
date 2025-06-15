package kr.co.cms.domain.auth.entity;

import lombok.Data;
import jakarta.persistence.*;

@Entity
@Table(name = "USER_ROLES")
@Data
public class UserRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROLE_ID")
    private Long roleId;
    
    @Column(name = "USER_ID")
    private String userId;
    
    @Column(name = "ROLE_TYPE")
    private String roleType; // STUDENT, COUNSELOR, PROFESSOR, ADMIN
}