package kr.co.cms.domain.mypage.service;

import java.util.List;
import java.util.stream.Collectors;

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
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.dto.FileInfoDTO;
import kr.co.cms.global.file.dto.FileUploadResponseDTO;
import org.springframework.web.multipart.MultipartFile;

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
    private final FileService fileService; 

	
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

	/**
	 * 전체 사용자 목록 조회 (관리자용)
	 */
	public List<MyPageProfileResponse> getAllUsers() {
		log.info("전체 사용자 목록 조회");

		try {
			// 통합 뷰에서 모든 사용자 조회
			List<UnifiedMyPageView> allUsers = myPageRepository.findAll();

			return allUsers.stream().map(this::convertToProfileResponse).collect(Collectors.toList());

		} catch (Exception e) {
			log.error("전체 사용자 목록 조회 실패: {}", e.getMessage());
			throw new RuntimeException("사용자 목록 조회에 실패했습니다.");
		}
	}

	/**
	 * 사용자 계정 상태 변경
	 */
	@Transactional
	public boolean updateUserAccountStatus(String userId, String newStatus) {
		log.info("사용자 계정 상태 변경: userId = {}, newStatus = {}", userId, newStatus);

		try {
			// USER_ACCOUNT 테이블의 상태 변경
			User user = userRepository.findByUserId(userId);
			if (user == null) {
				log.warn("사용자를 찾을 수 없음: userId = {}", userId);
				return false;
			}

			user.setStatus(newStatus);
			userRepository.save(user);

			log.info("사용자 계정 상태 변경 완료: userId = {}, newStatus = {}", userId, newStatus);
			return true;

		} catch (Exception e) {
			log.error("사용자 계정 상태 변경 실패: userId = {}, error = {}", userId, e.getMessage());
			throw new RuntimeException("계정 상태 변경에 실패했습니다.");
		}
	}

	/**
	 * 사용자 삭제 (실제로는 CASCADE로 관련 데이터도 함께 삭제됨)
	 */
	@Transactional
	public boolean deleteUser(String userId) {
		log.info("사용자 삭제: userId = {}", userId);

		try {
			User user = userRepository.findByUserId(userId);
			if (user == null) {
				log.warn("삭제할 사용자를 찾을 수 없음: userId = {}", userId);
				return false;
			}

			// USER_ACCOUNT 삭제 (CASCADE로 관련 데이터도 함께 삭제)
			userRepository.delete(user);

			log.info("사용자 삭제 완료: userId = {}", userId);
			return true;

		} catch (Exception e) {
			log.error("사용자 삭제 실패: userId = {}, error = {}", userId, e.getMessage());
			throw new RuntimeException("사용자 삭제에 실패했습니다.");
		}
	}
	
	//프로필 사진 관련
	/**
     * 프로필 이미지 업로드
     */
    @Transactional
    public MyPageProfileResponse uploadProfileImage(String userId, String userRole, MultipartFile file) {
        log.info("프로필 이미지 업로드: userId = {}, userRole = {}", userId, userRole);
        
        try {
            // 1. 기존 프로필 이미지들 삭제 (논리삭제)
            deleteExistingProfileImages(userId);
            
            // 2. 새 프로필 이미지 업로드
            FileUploadResponseDTO uploadResult = fileService.uploadSingleFile(
                file,
                FileConstants.RefType.USER,
                userId,
                FileConstants.Category.PROFILE,
                userId
            );
            
            if (!uploadResult.isSuccess()) {
                throw new RuntimeException("파일 업로드 실패: " + uploadResult.getMessage());
            }
            
            // 3. 사용자 테이블에 프로필 이미지 ID 업데이트
            updateUserProfileImageId(userId, userRole, uploadResult.getFileId());
            
            log.info("프로필 이미지 업로드 완료: userId = {}, fileId = {}", userId, uploadResult.getFileId());
            
            // 4. 업데이트된 프로필 정보 반환
            return getMyProfile(userId);
            
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 실패: userId = {}, error = {}", userId, e.getMessage(), e);
            throw new RuntimeException("프로필 이미지 업로드에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 프로필 이미지 삭제
     */
    @Transactional
    public MyPageProfileResponse deleteProfileImage(String userId, String userRole) {
        log.info("프로필 이미지 삭제: userId = {}, userRole = {}", userId, userRole);
        
        try {
            // 1. 기존 프로필 이미지들 삭제 (논리삭제)
            deleteExistingProfileImages(userId);
            
            // 2. 사용자 테이블에서 프로필 이미지 ID 제거
            removeUserProfileImageId(userId, userRole);
            
            log.info("프로필 이미지 삭제 완료: userId = {}", userId);
            
            // 3. 업데이트된 프로필 정보 반환
            return getMyProfile(userId);
            
        } catch (Exception e) {
            log.error("프로필 이미지 삭제 실패: userId = {}, error = {}", userId, e.getMessage(), e);
            throw new RuntimeException("프로필 이미지 삭제에 실패했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * 기존 프로필 이미지들 삭제 (논리삭제)
     */
    private void deleteExistingProfileImages(String userId) {
        try {
            List<FileInfoDTO> existingImages = fileService.getFileList(
                FileConstants.RefType.USER,
                userId,
                FileConstants.Category.PROFILE
            );
            
            for (FileInfoDTO imageFile : existingImages) {
                fileService.deleteFile(imageFile.getFileId(), userId);
            }
            
            if (!existingImages.isEmpty()) {
                log.info("기존 프로필 이미지 {}개 삭제: userId = {}", existingImages.size(), userId);
            }
            
        } catch (Exception e) {
            log.warn("기존 프로필 이미지 삭제 실패: userId = {}, error = {}", userId, e.getMessage());
            // 기존 이미지 삭제 실패해도 새 업로드는 진행
        }
    }
    
    /**
     * 사용자 테이블에 프로필 이미지 ID 업데이트
     */
    @Transactional
    protected void updateUserProfileImageId(String userId, String userRole, Long imageFileId) {
        log.info("사용자 테이블 프로필 이미지 ID 업데이트: userId = {}, role = {}, fileId = {}", 
                userId, userRole, imageFileId);
        
        switch (userRole) {
            case "STUDENT":
                int studentUpdateCount = stdInfoRepository.updateStudentProfileImage(userId, imageFileId);
                if (studentUpdateCount == 0) {
                    throw new RuntimeException("학생 프로필 이미지 업데이트 실패: " + userId);
                }
                break;
                
            case "PROFESSOR":
            case "COUNSELOR":
            case "ADMIN":
                int employeeUpdateCount = emplInfoRepository.updateEmployeeProfileImage(userId, imageFileId);
                if (employeeUpdateCount == 0) {
                    throw new RuntimeException("교직원 프로필 이미지 업데이트 실패: " + userId);
                }
                break;
                
            default:
                throw new RuntimeException("프로필 이미지 업데이트를 지원하지 않는 사용자 역할: " + userRole);
        }
    }
    
    /**
     * 사용자 테이블에서 프로필 이미지 ID 제거
     */
    @Transactional
    protected void removeUserProfileImageId(String userId, String userRole) {
        log.info("사용자 테이블 프로필 이미지 ID 제거: userId = {}, role = {}", userId, userRole);
        
        switch (userRole) {
            case "STUDENT":
                stdInfoRepository.removeStudentProfileImage(userId);
                break;
                
            case "PROFESSOR":
            case "COUNSELOR":
            case "ADMIN":
                emplInfoRepository.removeEmployeeProfileImage(userId);
                break;
                
            default:
                throw new RuntimeException("프로필 이미지 삭제를 지원하지 않는 사용자 역할: " + userRole);
        }
    }

	/**
	 * UnifiedMyPageView를 MyPageProfileResponse로 변환하는 헬퍼 메소드
	 */
    private MyPageProfileResponse convertToProfileResponse(UnifiedMyPageView view) {
        // 동적으로 프로필 이미지 URL 조회
        String profileImageUrl = getProfileImageUrl(view.getUserId());
        
        return MyPageProfileResponse.builder()
                .userId(view.getUserId())
                .userType(view.getUserType())
                .identifierNo(view.getIdentifierNo())
                .userName(view.getUserName())
                .deptCode(view.getDeptCode())
                .deptName(view.getDeptName())
                .gradeYear(view.getGradeYear())
                .enterDate(view.getEnterDate())
                .statusCode(view.getStatusCode())
                .postalCode(view.getPostalCode())
                .address(view.getAddress())
                .detailAddress(view.getDetailAddress())
                .phoneNumber(view.getPhoneNumber())
                .email(view.getEmail())
                .accountStatus(view.getAccountStatus())
                .accountCreatedDate(view.getAccountCreatedDate())
                .provider(view.getProvider())
                .profileImageUrl(profileImageUrl) 
                .lastLoginDate(view.getLastLoginDate())
                .build();
    }
    
    /**
     * 사용자의 프로필 이미지 URL 동적 조회
     */
    private String getProfileImageUrl(String userId) {
        try {
            log.debug("프로필 이미지 URL 조회 시작: userId = {}", userId);
            
            // FileService를 사용해서 사용자의 프로필 이미지 파일 목록 조회
            List<FileInfoDTO> profileImages = fileService.getFileList(
                FileConstants.RefType.USER, 
                userId, 
                FileConstants.Category.PROFILE
            );
            
            log.debug("조회된 프로필 이미지 파일 수: {}", profileImages.size());
            
            if (profileImages != null && !profileImages.isEmpty()) {
                // 가장 최근 업로드된 파일 또는 첫 번째 파일의 fileId로 URL 생성
                FileInfoDTO latestImage = profileImages.get(0);
                Long fileId = latestImage.getFileId();
                
                String imageUrl = "/api/files/" + fileId + "/download";
                
                log.debug("프로필 이미지 URL 생성 성공: userId = {}, fileId = {}, url = {}", 
                         userId, fileId, imageUrl);
                return imageUrl;
            } else {
                log.debug("프로필 이미지 없음: userId = {}", userId);
            }
            
        } catch (Exception e) {
            log.warn("프로필 이미지 URL 조회 실패: userId = {}, error = {}", userId, e.getMessage());
        }
        
        return null; // 프로필 이미지가 없으면 null 반환
    }
}