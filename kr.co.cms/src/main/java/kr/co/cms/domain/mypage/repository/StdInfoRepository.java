package kr.co.cms.domain.mypage.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.mypage.entity.StdInfo;

@Repository
public interface StdInfoRepository extends JpaRepository<StdInfo, String> {
    
    // 학번으로 학생 정보 조회
    Optional<StdInfo> findByStdNo(String stdNo);
    
    // 사용자 ID로 학생 정보 조회
    Optional<StdInfo> findByUserId(String userId);
    
    // 학과별 학생 수 조회
    long countByDeptCd(String deptCd);
    
    // 학년별 학생 수 조회
    long countBySchYr(Integer schYr);
    
    // 이메일로 학생 조회
    Optional<StdInfo> findByEmail(String email);
    
    // 연락처로 학생 조회
    Optional<StdInfo> findByPhoneNumber(String phoneNumber);
    
    // 사용자 ID로 학생 정보 업데이트
    @Modifying
    @Query("UPDATE StdInfo s SET s.phoneNumber = :phoneNumber, s.email = :email, s.postalCode = :postalCode, s.address = :address, s.detailAddress = :detailAddress WHERE s.userId = :userId")
    int updateStudentProfile(@Param("userId") String userId, 
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