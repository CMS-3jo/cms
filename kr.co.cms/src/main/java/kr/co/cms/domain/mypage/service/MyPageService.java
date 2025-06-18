package kr.co.cms.domain.mypage.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.repository.UserRepository;
import kr.co.cms.domain.mypage.dto.ChangePasswordRequest;
import kr.co.cms.domain.mypage.dto.MyPageProfileResponse;
import kr.co.cms.domain.mypage.dto.UpdateProfileRequest;
import kr.co.cms.domain.mypage.entity.EmplInfo;
import kr.co.cms.domain.mypage.entity.StdInfo;
import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;
import kr.co.cms.domain.mypage.repository.EmplInfoRepository;
import kr.co.cms.domain.mypage.repository.GuestSocialUserMyPageRepository;
import kr.co.cms.domain.mypage.repository.MyPageRepository;
import kr.co.cms.domain.mypage.repository.StdInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MyPageService {
    
    private final MyPageRepository myPageRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StdInfoRepository stdInfoRepository;
    private final EmplInfoRepository emplInfoRepository;
    private final GuestSocialUserMyPageRepository guestSocialUserRepository;
    
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
            validateEmailDuplication(userId, currentInfo.getUserType(), request.getEmail());
        }
        
        // 연락처 중복 확인
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(currentInfo.getPhoneNumber())) {
            validatePhoneDuplication(userId, currentInfo.getUserType(), request.getPhoneNumber());
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
    
    // 이메일 중복 검증
    private void validateEmailDuplication(String userId, String userType, String email) {
        boolean isDuplicate = false;
        
        switch (userType) {
            case "STUDENT":
                isDuplicate = stdInfoRepository.existsByEmailAndUserIdNot(email, userId);
                break;
            case "COUNSELOR":
            case "PROFESSOR":
            case "ADMIN":
                isDuplicate = emplInfoRepository.existsByEmailAndUserIdNot(email, userId);
                break;
            case "GUEST":
                // 게스트는 guestId로 확인해야 하므로 별도 처리 필요
                break;
        }
        
        if (isDuplicate) {
            throw new RuntimeException("이미 사용 중인 이메일입니다: " + email);
        }
    }
    
    // 연락처 중복 검증
    private void validatePhoneDuplication(String userId, String userType, String phoneNumber) {
        boolean isDuplicate = false;
        
        switch (userType) {
            case "STUDENT":
                isDuplicate = stdInfoRepository.existsByPhoneNumberAndUserIdNot(phoneNumber, userId);
                break;
            case "COUNSELOR":
            case "PROFESSOR":
            case "ADMIN":
                isDuplicate = emplInfoRepository.existsByPhoneNumberAndUserIdNot(phoneNumber, userId);
                break;
            case "GUEST":
                // 게스트는 연락처 정보가 없으므로 스킵
                break;
        }
        
        if (isDuplicate) {
            throw new RuntimeException("이미 사용 중인 연락처입니다: " + phoneNumber);
        }
    }
    
    // 사용자 타입별 정보 업데이트
    @Transactional
    protected void updateUserInfoByType(String userId, String userType, UpdateProfileRequest request) {
        log.info("사용자 타입 {} 정보 업데이트: userId = {}", userType, userId);
        
        switch (userType) {
            case "STUDENT":
                updateStudentInfo(userId, request);
                break;
            case "COUNSELOR":
            case "PROFESSOR":
            case "ADMIN":
                updateEmployeeInfo(userId, request);
                break;
            case "GUEST":
                updateGuestInfo(userId, request);
                break;
            default:
                throw new RuntimeException("지원하지 않는 사용자 타입입니다: " + userType);
        }
    }
    
    // 학생 정보 업데이트
    private void updateStudentInfo(String userId, UpdateProfileRequest request) {
        log.info("학생 정보 업데이트: userId = {}", userId);
        
        StdInfo student = stdInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("학생 정보를 찾을 수 없습니다: " + userId));
        
        if (request.getPhoneNumber() != null) {
            student.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null) {
            student.setEmail(request.getEmail());
        }
        if (request.getPostalCode() != null) {
            student.setPostalCode(request.getPostalCode());
        }
        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }
        if (request.getDetailAddress() != null) {
            student.setDetailAddress(request.getDetailAddress());
        }
        
        stdInfoRepository.save(student);
        log.info("학생 정보 업데이트 완료: userId = {}", userId);
    }
    
    // 교직원 정보 업데이트
    private void updateEmployeeInfo(String userId, UpdateProfileRequest request) {
        log.info("교직원 정보 업데이트: userId = {}", userId);
        
        EmplInfo employee = emplInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("교직원 정보를 찾을 수 없습니다: " + userId));
        
        if (request.getPhoneNumber() != null) {
            employee.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getEmail() != null) {
            employee.setEmail(request.getEmail());
        }
        if (request.getPostalCode() != null) {
            employee.setPostalCode(request.getPostalCode());
        }
        if (request.getAddress() != null) {
            employee.setAddress(request.getAddress());
        }
        if (request.getDetailAddress() != null) {
            employee.setDetailAddress(request.getDetailAddress());
        }
        
        emplInfoRepository.save(employee);
        log.info("교직원 정보 업데이트 완료: userId = {}", userId);
    }
    
    // 게스트 정보 업데이트
    private void updateGuestInfo(String userId, UpdateProfileRequest request) {
        log.info("게스트 정보 업데이트: userId = {}", userId);
        
        // 게스트는 providerId로 조회해야 함
        // 실제 구현에서는 userId를 이용해 guestId를 찾는 로직 필요
        
        log.info("게스트 정보 업데이트 스킵 (현재 구현 제한): userId = {}", userId);
    }
}