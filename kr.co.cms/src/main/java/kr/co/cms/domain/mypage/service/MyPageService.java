package kr.co.cms.domain.mypage.service;

import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.repository.UserRepository;
import kr.co.cms.domain.mypage.dto.ChangePasswordRequest;
import kr.co.cms.domain.mypage.dto.MyPageProfileResponse;
import kr.co.cms.domain.mypage.dto.UpdateProfileRequest;
import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;
import kr.co.cms.domain.mypage.repository.MyPageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MyPageService {
    
    private final MyPageRepository myPageRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // 마이페이지 프로필 조회
    public MyPageProfileResponse getMyProfile(String userId) {
        log.info("마이페이지 프로필 조회 요청: userId = {}", userId);
        
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다: " + userId));
        
        return convertToProfileResponse(userInfo);
    }
    
    // 프로필 정보 수정
    @Transactional
    public MyPageProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        log.info("프로필 수정 요청: userId = {}", userId);
        
        // 현재 사용자 정보 조회
        UnifiedMyPageView currentInfo = myPageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다: " + userId));
        
        // 이메일 중복 확인
        if (request.getEmail() != null && !request.getEmail().equals(currentInfo.getEmail())) {
            if (myPageRepository.existsByEmailAndUserIdNot(request.getEmail(), userId)) {
                throw new RuntimeException("이미 사용 중인 이메일입니다: " + request.getEmail());
            }
        }
        
        // 연락처 중복 확인
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(currentInfo.getPhoneNumber())) {
            if (myPageRepository.existsByPhoneNumberAndUserIdNot(request.getPhoneNumber(), userId)) {
                throw new RuntimeException("이미 사용 중인 연락처입니다: " + request.getPhoneNumber());
            }
        }
        
        // 사용자 타입에 따라 적절한 테이블 업데이트
        updateUserInfoByType(userId, currentInfo.getUserType(), request);
        
        // 업데이트된 정보 다시 조회
        UnifiedMyPageView updatedInfo = myPageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("업데이트된 사용자 정보를 찾을 수 없습니다"));
        
        log.info("프로필 수정 완료: userId = {}", userId);
        return convertToProfileResponse(updatedInfo);
    }
    
    // 비밀번호 변경
    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        log.info("비밀번호 변경 요청: userId = {}", userId);
        
        // 새 비밀번호 확인
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("새 비밀번호와 확인 비밀번호가 일치하지 않습니다");
        }
        
        // 현재 사용자 조회
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다: " + userId);
        }
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("현재 비밀번호가 올바르지 않습니다");
        }
        
        // 새 비밀번호로 업데이트
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("비밀번호 변경 완료: userId = {}", userId);
    }
    
    // 사용자 정보 삭제 (회원 탈퇴)
    @Transactional
    public void deleteUser(String userId) {
        log.info("회원 탈퇴 요청: userId = {}", userId);
        
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다: " + userId);
        }
        
        // 사용자 계정 삭제 (CASCADE로 관련 정보도 삭제됨)
        userRepository.delete(user);
        
        log.info("회원 탈퇴 완료: userId = {}", userId);
    }
    
    // Entity를 DTO로 변환
    private MyPageProfileResponse convertToProfileResponse(UnifiedMyPageView userInfo) {
        return MyPageProfileResponse.builder()
                .userId(userInfo.getUserId())
                .userType(userInfo.getUserType())
                .identifierNo(userInfo.getIdentifierNo())
                .userName(userInfo.getUserName())
                .deptCode(userInfo.getDeptCode())
                .deptName(userInfo.getDeptName())
                .gradeYear(userInfo.getGradeYear())
                .enterDate(userInfo.getEnterDate())
                .statusCode(userInfo.getStatusCode())
                .postalCode(userInfo.getPostalCode())
                .address(userInfo.getAddress())
                .detailAddress(userInfo.getDetailAddress())
                .phoneNumber(userInfo.getPhoneNumber())
                .email(userInfo.getEmail())
                .accountStatus(userInfo.getAccountStatus())
                .accountCreatedDate(userInfo.getAccountCreatedDate())
                .provider(userInfo.getProvider())
                .profileImageUrl(userInfo.getProfileImageUrl())
                .lastLoginDate(userInfo.getLastLoginDate())
                .build();
    }
    
    // 사용자 타입별 정보 업데이트
    @Transactional
    protected void updateUserInfoByType(String userId, String userType, UpdateProfileRequest request) {
        // 실제 구현에서는 userType에 따라 STD_INFO 또는 EMPL_INFO 테이블을 직접 업데이트
        // 여기서는 예시로 로그만 출력
        log.info("사용자 타입 {} 정보 업데이트: userId = {}", userType, userId);
        
        switch (userType) {
            case "STUDENT":
                // 학생 정보 업데이트 로직
                updateStudentInfo(userId, request);
                break;
            case "COUNSELOR":
            case "PROFESSOR":
            case "ADMIN":
                // 교직원 정보 업데이트 로직
                updateEmployeeInfo(userId, request);
                break;
            case "GUEST":
                // 게스트 정보 업데이트 로직
                updateGuestInfo(userId, request);
                break;
            default:
                throw new RuntimeException("지원하지 않는 사용자 타입입니다: " + userType);
        }
    }
    
    // 학생 정보 업데이트 (실제 구현 필요)
    private void updateStudentInfo(String userId, UpdateProfileRequest request) {
        // STD_INFO 테이블 업데이트 로직
        log.info("학생 정보 업데이트: userId = {}", userId);
    }
    
    // 교직원 정보 업데이트 (실제 구현 필요)
    private void updateEmployeeInfo(String userId, UpdateProfileRequest request) {
        // EMPL_INFO 테이블 업데이트 로직
        log.info("교직원 정보 업데이트: userId = {}", userId);
    }
    
    // 게스트 정보 업데이트 (실제 구현 필요)
    private void updateGuestInfo(String userId, UpdateProfileRequest request) {
        // GUEST_SOCIAL_USER 테이블 업데이트 로직
        log.info("게스트 정보 업데이트: userId = {}", userId);
    }
}