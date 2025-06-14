package kr.co.cms.domain.mypage.controller;

import kr.co.cms.domain.mypage.dto.ChangePasswordRequest;
import kr.co.cms.domain.mypage.dto.MyPageProfileResponse;
import kr.co.cms.domain.mypage.dto.SimpleResponse;
import kr.co.cms.domain.mypage.dto.UpdateProfileRequest;
import kr.co.cms.domain.mypage.service.MyPageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(
    origins = "http://localhost:5173", 
    allowCredentials = "true",
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class MyPageController {
    
    private final MyPageService myPageService;
    
    // 마이페이지 프로필 조회
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal String userId) {
        try {
            log.info("마이페이지 프로필 조회 요청: userId = {}", userId);
            
            MyPageProfileResponse profile = myPageService.getMyProfile(userId);
            
            return ResponseEntity.ok(SimpleResponse.success("프로필 조회 성공", profile));
        } catch (Exception e) {
            log.error("프로필 조회 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("프로필 조회 실패: " + e.getMessage()));
        }
    }
    
    // 프로필 정보 수정
    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        try {
            log.info("프로필 수정 요청: userId = {}", userId);
            
            MyPageProfileResponse updatedProfile = myPageService.updateProfile(userId, request);
            
            return ResponseEntity.ok(SimpleResponse.success("프로필 수정 성공", updatedProfile));
        } catch (Exception e) {
            log.error("프로필 수정 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("프로필 수정 실패: " + e.getMessage()));
        }
    }
    
    // 비밀번호 변경
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        try {
            log.info("비밀번호 변경 요청: userId = {}", userId);
            
            myPageService.changePassword(userId, request);
            
            return ResponseEntity.ok(SimpleResponse.success("비밀번호 변경 성공"));
        } catch (Exception e) {
            log.error("비밀번호 변경 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("비밀번호 변경 실패: " + e.getMessage()));
        }
    }
    
    // 계정 삭제 (회원 탈퇴)
    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal String userId) {
        try {
            log.info("회원 탈퇴 요청: userId = {}", userId);
            
            myPageService.deleteUser(userId);
            
            return ResponseEntity.ok(SimpleResponse.success("회원 탈퇴 완료"));
        } catch (Exception e) {
            log.error("회원 탈퇴 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("회원 탈퇴 실패: " + e.getMessage()));
        }
    }
    
    // 프로필 이미지 업로드 (게스트용 - 추후 구현)
    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file
    ) {
        try {
            log.info("프로필 이미지 업로드 요청: userId = {}", userId);
            
            // TODO: 파일 업로드 로직 구현
            
            return ResponseEntity.ok(SimpleResponse.success("프로필 이미지 업로드 성공"));
        } catch (Exception e) {
            log.error("프로필 이미지 업로드 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("프로필 이미지 업로드 실패: " + e.getMessage()));
        }
    }
    
    // 사용자 정보 요약 조회 (헤더 표시용)
    @GetMapping("/summary")
    public ResponseEntity<?> getProfileSummary(@AuthenticationPrincipal String userId) {
        try {
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
            log.error("프로필 요약 조회 실패: userId = {}, error = {}", userId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(SimpleResponse.error("프로필 요약 조회 실패: " + e.getMessage()));
        }
    }
}