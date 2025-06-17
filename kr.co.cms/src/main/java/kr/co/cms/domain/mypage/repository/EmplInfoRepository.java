package kr.co.cms.domain.mypage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.mypage.entity.EmplInfo;

@Repository
public interface EmplInfoRepository extends JpaRepository<EmplInfo, String> {
    
    // 사번으로 교직원 정보 조회
    Optional<EmplInfo> findByEmplNo(String emplNo);
    
    // 사용자 ID로 교직원 정보 조회
    Optional<EmplInfo> findByUserId(String userId);
    
    // 학과별 교직원 수 조회
    long countByDeptCd(String deptCd);
    
    // 이메일로 교직원 조회
    Optional<EmplInfo> findByEmail(String email);
    
    // 연락처로 교직원 조회
    Optional<EmplInfo> findByPhoneNumber(String phoneNumber);
    
    // 사용자 ID로 교직원 정보 업데이트
    @Modifying
    @Query("UPDATE EmplInfo e SET e.phoneNumber = :phoneNumber, e.email = :email, e.postalCode = :postalCode, e.address = :address, e.detailAddress = :detailAddress WHERE e.userId = :userId")
    int updateEmployeeProfile(@Param("userId") String userId, 
                            @Param("phoneNumber") String phoneNumber,
                            @Param("email") String email,
                            @Param("postalCode") String postalCode,
                            @Param("address") String address,
                            @Param("detailAddress") String detailAddress);
    
    // 이메일 중복 확인 (자신 제외)
    boolean existsByEmailAndUserIdNot(String email, String userId);
    
    // 연락처 중복 확인 (자신 제외)
    boolean existsByPhoneNumberAndUserIdNot(String phoneNumber, String userId);
}