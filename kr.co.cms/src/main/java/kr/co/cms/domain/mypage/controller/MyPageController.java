package kr.co.cms.domain.mypage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kr.co.cms.domain.mypage.dto.ChangePasswordRequest;
import kr.co.cms.domain.mypage.dto.MyPageProfileResponse;
import kr.co.cms.domain.mypage.dto.SimpleResponse;
import kr.co.cms.domain.mypage.dto.UpdateProfileRequest;
import kr.co.cms.domain.mypage.service.MyPageService;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true", allowedHeaders = "*", methods = {
		RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class MyPageController {

	private final MyPageService myPageService;
	private final FileService fileService;
	private final JwtUtil jwtUtil;

	// 쿠키에서 사용자 ID 추출하는 헬퍼 메서드
	private String getUserIdFromRequest(HttpServletRequest request) {
		// 쿠키에서 accessToken 추출
		String accessToken = null;
		if (request.getCookies() != null) {
			for (Cookie cookie : request.getCookies()) {
				if ("accessToken".equals(cookie.getName())) {
					accessToken = cookie.getValue();
					break;
				}
			}
		}

		if (accessToken == null) {
			throw new RuntimeException("Access Token이 없습니다. 로그인이 필요합니다.");
		}

		// JWT 토큰 검증 및 사용자 ID 추출
		if (!jwtUtil.isValidToken(accessToken)) {
			throw new RuntimeException("유효하지 않은 토큰입니다.");
		}

		return jwtUtil.getUserId(accessToken);
	}

	// 마이페이지 프로필 조회
	@GetMapping("/profile")
	public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
		try {
			String userId = getUserIdFromRequest(request);
			log.info("마이페이지 프로필 조회 요청: userId = {}", userId);

			MyPageProfileResponse profile = myPageService.getMyProfile(userId);

			return ResponseEntity.ok(SimpleResponse.success("프로필 조회 성공", profile));
		} catch (Exception e) {
			log.error("프로필 조회 실패: error = {}", e.getMessage());
			return ResponseEntity.badRequest().body(SimpleResponse.error("프로필 조회 실패: " + e.getMessage()));
		}
	}

	// 프로필 정보 수정
	@PutMapping("/profile")
	public ResponseEntity<?> updateMyProfile(HttpServletRequest request,
			@Valid @RequestBody UpdateProfileRequest updateRequest) {
		try {
			String userId = getUserIdFromRequest(request);
			log.info("프로필 수정 요청: userId = {}", userId);

			MyPageProfileResponse updatedProfile = myPageService.updateProfile(userId, updateRequest);

			return ResponseEntity.ok(SimpleResponse.success("프로필 수정 성공", updatedProfile));
		} catch (Exception e) {
			log.error("프로필 수정 실패: error = {}", e.getMessage());
			return ResponseEntity.badRequest().body(SimpleResponse.error("프로필 수정 실패: " + e.getMessage()));
		}
	}

	// 비밀번호 변경
	@PutMapping("/password")
	public ResponseEntity<?> changePassword(HttpServletRequest request,
			@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
		try {
			String userId = getUserIdFromRequest(request);
			log.info("비밀번호 변경 요청: userId = {}", userId);

			myPageService.changePassword(userId, changePasswordRequest);

			return ResponseEntity.ok(SimpleResponse.success("비밀번호 변경 성공"));
		} catch (Exception e) {
			log.error("비밀번호 변경 실패: error = {}", e.getMessage());
			return ResponseEntity.badRequest().body(SimpleResponse.error("비밀번호 변경 실패: " + e.getMessage()));
		}
	}

	// 계정 삭제 (회원 탈퇴)
	@DeleteMapping("/account")
	public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
		try {
			String userId = getUserIdFromRequest(request);
			log.info("회원 탈퇴 요청: userId = {}", userId);

			myPageService.deleteUser(userId);

			return ResponseEntity.ok(SimpleResponse.success("회원 탈퇴 완료"));
		} catch (Exception e) {
			log.error("회원 탈퇴 실패: error = {}", e.getMessage());
			return ResponseEntity.badRequest().body(SimpleResponse.error("회원 탈퇴 실패: " + e.getMessage()));
		}
	}

	// 사용자 정보 요약 조회 (헤더 표시용)
	@GetMapping("/summary")
	public ResponseEntity<?> getProfileSummary(HttpServletRequest request) {
		try {
			String userId = getUserIdFromRequest(request);
			log.info("프로필 요약 조회 요청: userId = {}", userId);

			MyPageProfileResponse profile = myPageService.getMyProfile(userId);

			// 요약 정보만 추출
			var summary = new Object() {
				public final String userId = profile.getUserId();
				public final String userName = profile.getUserName();
				public final String identifierNo = profile.getIdentifierNo();
				public final String userType = profile.getUserType();
				public final String deptName = profile.getDeptName();
			};

			return ResponseEntity.ok(SimpleResponse.success("프로필 요약 조회 성공", summary));
		} catch (Exception e) {
			log.error("프로필 요약 조회 실패: error = {}", e.getMessage());
			return ResponseEntity.badRequest().body(SimpleResponse.error("프로필 요약 조회 실패: " + e.getMessage()));
		}
	}

	/**
	 * 프로필 이미지 업로드
	 */
	@PostMapping("/profile-image")
	public ResponseEntity<?> uploadProfileImage(HttpServletRequest request, @RequestParam("file") MultipartFile file) {
		try {
			String userId = getUserIdFromRequest(request);
			String userRole = getUserRoleFromRequest(request);

			// 소셜 사용자는 업로드 불가
			if ("GUEST".equals(userRole) || "EXTERNAL".equals(userRole)) {
				return ResponseEntity.badRequest().body(SimpleResponse.error("소셜 로그인 사용자는 프로필 이미지를 업로드할 수 없습니다."));
			}

			// 팀원의 파일 시스템 사용
			var uploadResult = fileService.uploadSingleFile(file, FileConstants.RefType.USER, userId,
					FileConstants.Category.PROFILE, userId);

			if (!uploadResult.isSuccess()) {
				return ResponseEntity.badRequest().body(SimpleResponse.error(uploadResult.getMessage()));
			}

			// 프로필 정보 다시 조회해서 반환
			MyPageProfileResponse profile = myPageService.getMyProfile(userId);
			return ResponseEntity.ok(SimpleResponse.success("프로필 이미지 업로드 성공", profile));

		} catch (Exception e) {
			log.error("프로필 이미지 업로드 실패: {}", e.getMessage(), e);
			return ResponseEntity.badRequest().body(SimpleResponse.error("프로필 이미지 업로드 실패: " + e.getMessage()));
		}
	}

	/**
	 * 프로필 이미지 삭제
	 */
	@DeleteMapping("/profile-image")
	public ResponseEntity<?> deleteProfileImage(HttpServletRequest request) {
		try {
			String userId = getUserIdFromRequest(request);
			String userRole = getUserRoleFromRequest(request);

			// 소셜 사용자는 삭제 불가
			if ("GUEST".equals(userRole) || "EXTERNAL".equals(userRole)) {
				return ResponseEntity.badRequest().body(SimpleResponse.error("소셜 로그인 사용자는 프로필 이미지를 삭제할 수 없습니다."));
			}

			// 현재 프로필 이미지 파일들 삭제
			var profileImages = fileService.getFileList(FileConstants.RefType.USER, userId,
					FileConstants.Category.PROFILE);

			for (var fileInfo : profileImages) {
				fileService.deleteFile(fileInfo.getFileId(), userId);
			}

			// 프로필 정보 다시 조회해서 반환
			MyPageProfileResponse profile = myPageService.getMyProfile(userId);
			return ResponseEntity.ok(SimpleResponse.success("프로필 이미지 삭제 성공", profile));

		} catch (Exception e) {
			log.error("프로필 이미지 삭제 실패: {}", e.getMessage(), e);
			return ResponseEntity.badRequest().body(SimpleResponse.error("프로필 이미지 삭제 실패: " + e.getMessage()));
		}
	}
	/**
	 * 요청에서 사용자 역할 추출
	 */
	private String getUserRoleFromRequest(HttpServletRequest request) {
	    String accessToken = extractAccessToken(request);
	    
	    if (accessToken != null && jwtUtil.isValidToken(accessToken)) {
	        try {
	            return jwtUtil.getRole(accessToken); // JwtUtil의 getRole 메서드 사용
	        } catch (Exception e) {
	            log.debug("역할 추출 실패: {}", e.getMessage());
	            return null;
	        }
	    }
	    return null;
	}

	/**
	 * 요청에서 액세스 토큰 추출
	 */
	private String extractAccessToken(HttpServletRequest request) {
	    // 쿠키에서 accessToken 추출
	    if (request.getCookies() != null) {
	        for (Cookie cookie : request.getCookies()) {
	            if ("accessToken".equals(cookie.getName())) {
	                return cookie.getValue();
	            }
	        }
	    }
	    
	    // Authorization 헤더에서 추출
	    String authHeader = request.getHeader("Authorization");
	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        return authHeader.substring(7);
	    }
	    
	    return null;
	}
}
