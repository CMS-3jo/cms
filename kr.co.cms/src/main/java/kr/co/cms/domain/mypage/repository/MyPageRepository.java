package kr.co.cms.domain.mypage.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;

@Repository
public interface MyPageRepository extends JpaRepository<UnifiedMyPageView, String> {

	// 사용자 ID로 마이페이지 정보 조회
	Optional<UnifiedMyPageView> findByUserId(String userId);

	// 사용자 타입별 조회
	@Query("SELECT m FROM UnifiedMyPageView m WHERE m.userId = :userId AND m.userType = :userType")
	Optional<UnifiedMyPageView> findByUserIdAndUserType(@Param("userId") String userId,
			@Param("userType") String userType);

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

	/**
	 * 전체 사용자 조회 (관리자용)
	 */
	List<UnifiedMyPageView> findAll();

	/**
	 * 사용자 타입별 조회
	 */
	List<UnifiedMyPageView> findByUserType(String userType);

	/**
	 * 계정 상태별 조회
	 */
	List<UnifiedMyPageView> findByAccountStatus(String accountStatus);

	/**
	 * 이름으로 검색
	 */
	List<UnifiedMyPageView> findByUserNameContainingIgnoreCase(String userName);

	/**
	 * 복합 검색 (이름 또는 사용자ID 또는 식별번호로 검색)
	 */
	@Query("SELECT u FROM UnifiedMyPageView u WHERE " + "LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(u.userId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(u.identifierNo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR "
			+ "LOWER(u.deptName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
	List<UnifiedMyPageView> searchUsers(@Param("keyword") String keyword);

	/**
	 * 역할과 상태로 필터링
	 */
	@Query("SELECT u FROM UnifiedMyPageView u WHERE " + "(:userType IS NULL OR u.userType = :userType) AND "
			+ "(:accountStatus IS NULL OR u.accountStatus = :accountStatus)")
	List<UnifiedMyPageView> findByUserTypeAndAccountStatus(@Param("userType") String userType,
			@Param("accountStatus") String accountStatus);

	/**
	 * 통계용 쿼리들
	 */
	@Query("SELECT u.userType, COUNT(u) FROM UnifiedMyPageView u GROUP BY u.userType")
	List<Object[]> getUserCountByType();

	@Query("SELECT u.accountStatus, COUNT(u) FROM UnifiedMyPageView u GROUP BY u.accountStatus")
	List<Object[]> getUserCountByStatus();

	@Query("SELECT u.deptName, COUNT(u) FROM UnifiedMyPageView u WHERE u.deptName IS NOT NULL GROUP BY u.deptName")
	List<Object[]> getUserCountByDept();

}