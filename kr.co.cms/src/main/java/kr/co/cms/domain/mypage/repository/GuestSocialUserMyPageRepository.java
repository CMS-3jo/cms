package kr.co.cms.domain.mypage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.auth.entity.GuestSocialUser;

@Repository
public interface GuestSocialUserMyPageRepository extends JpaRepository<GuestSocialUser, Integer> {
    
    // 게스트 ID로 조회
    Optional<GuestSocialUser> findByGuestId(Integer guestId);
    
    // 제공업체와 제공업체 ID로 사용자 조회
    Optional<GuestSocialUser> findByProviderAndProviderId(String provider, String providerId);
    
    // 이메일로 게스트 사용자 조회
    Optional<GuestSocialUser> findByEmail(String email);
    
    // 활성 사용자만 조회
    @Query("SELECT g FROM GuestSocialUser g WHERE g.provider = :provider AND g.providerId = :providerId AND g.accountStatus = 'ACTIVE'")
    Optional<GuestSocialUser> findActiveUserByProviderAndProviderId(@Param("provider") String provider, @Param("providerId") String providerId);
    
    // 게스트 사용자 정보 업데이트 (이메일과 프로필 이미지만 수정 가능)
    @Modifying
    @Query("UPDATE GuestSocialUser g SET g.email = :email, g.profileImageUrl = :profileImageUrl WHERE g.guestId = :guestId")
    int updateGuestProfile(@Param("guestId") Integer guestId,
                          @Param("email") String email,
                          @Param("profileImageUrl") String profileImageUrl);
    
    // 이메일 중복 확인 (자신 제외)
    boolean existsByEmailAndGuestIdNot(String email, Integer guestId);
    
    // 제공업체별 사용자 수 조회
    @Query("SELECT COUNT(g) FROM GuestSocialUser g WHERE g.provider = :provider")
    long countByProvider(@Param("provider") String provider);
}