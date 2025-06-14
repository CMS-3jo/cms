package kr.co.cms.domain.auth.repository;

import kr.co.cms.domain.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    RefreshToken findByRefreshToken(String refreshToken);
    RefreshToken findByUserId(String userId);
    void deleteByUserId(String userId);
}