package kr.co.cms.domain.mypage.repository;

import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MyPageRepository extends JpaRepository<UnifiedMyPageView, String> {
    
    // 사용자 ID로 마이페이지 정보 조회
    Optional<UnifiedMyPageView> findByUserId(String userId);
    
    // 사용자 타입별 조회
    @Query("SELECT m FROM UnifiedMyPageView m WHERE m.userId = :userId AND m.userType = :userType")
    Optional<UnifiedMyPageView> findByUserIdAndUserType(@Param("userId") String userId, @Param("userType") String userType);
    
    // 학번/사번으로 조회
    @Query("SELECT m FROM UnifiedMyPageView m WHERE m.identifierNo = :identifierNo")
    Optional<UnifiedMyPageView> findByIdentifierNo(@Param("identifierNo") String identifierNo);
    
    // 이름으로 검색 (관리자용)
    @Query("SELECT m FROM UnifiedMyPageView m WHERE m.userName LIKE %:userName%")
    Optional<UnifiedMyPageView> findByUserNameContaining(@Param("userName") String userName);
    
    // 학과별 사용자 조회
    @Query("SELECT m FROM UnifiedMyPageView m WHERE m.deptCode = :deptCode")
    Optional<UnifiedMyPageView> findByDeptCode(@Param("deptCode") String deptCode);
    
    // 사용자 존재 여부 확인
    boolean existsByUserId(String userId);
    
    // 이메일 중복 확인
    boolean existsByEmailAndUserIdNot(String email, String userId);
    
    // 연락처 중복 확인
    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, String userId);
}