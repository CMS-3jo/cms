package kr.co.cms.domain.auth.repository;

import kr.co.cms.domain.auth.entity.GuestSocialUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuestSocialUserRepository extends JpaRepository<GuestSocialUser, Integer> {
    
    // 제공업체와 제공업체 ID로 사용자 조회
    Optional<GuestSocialUser> findByProviderAndProviderId(String provider, String providerId);
    
    // 이메일로 사용자 조회
    Optional<GuestSocialUser> findByEmail(String email);
    
    // 제공업체별 사용자 수 조회
    @Query("SELECT COUNT(g) FROM GuestSocialUser g WHERE g.provider = :provider")
    long countByProvider(@Param("provider") String provider);
    
    // 활성 사용자만 조회
    @Query("SELECT g FROM GuestSocialUser g WHERE g.provider = :provider AND g.providerId = :providerId AND g.accountStatus = 'ACTIVE'")
    Optional<GuestSocialUser> findActiveUserByProviderAndProviderId(@Param("provider") String provider, @Param("providerId") String providerId);
    
    // 이메일 중복 확인 (다른 제공업체 포함)
    boolean existsByEmail(String email);
    
    // 특정 제공업체에서 이메일 중복 확인
    boolean existsByProviderAndEmail(String provider, String email);
    
    // guestId로 조회 (Primary Key 사용)
    Optional<GuestSocialUser> findByGuestId(Integer guestId);
    
    // 특정 제공업체의 활성 사용자 목록 조회
    @Query("SELECT g FROM GuestSocialUser g WHERE g.provider = :provider AND g.accountStatus = 'ACTIVE' ORDER BY g.createdDate DESC")
    List<GuestSocialUser> findActiveUsersByProvider(@Param("provider") String provider);
}