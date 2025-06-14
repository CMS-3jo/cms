package kr.co.cms.domain.auth.repository;

import kr.co.cms.domain.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    UserRole findByUserId(String userId);
}