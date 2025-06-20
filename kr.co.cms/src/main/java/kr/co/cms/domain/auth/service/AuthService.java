package kr.co.cms.domain.auth.service;

import kr.co.cms.domain.auth.dto.CreateRegisteredUserRequest;
import kr.co.cms.domain.auth.dto.CreateUserResponse;
import kr.co.cms.domain.auth.dto.LoginRequest;
import kr.co.cms.domain.auth.dto.LoginResponse;
import kr.co.cms.domain.auth.dto.RefreshRequest;
import kr.co.cms.domain.auth.entity.User;
import kr.co.cms.domain.auth.entity.UserRole;
import kr.co.cms.domain.auth.repository.UserRepository;
import kr.co.cms.domain.auth.repository.UserRoleRepository;
import kr.co.cms.domain.dept.repository.DeptInfoRepository;
import kr.co.cms.domain.mypage.entity.EmplInfo;
import kr.co.cms.domain.mypage.entity.StdInfo;
import kr.co.cms.domain.mypage.entity.UnifiedMyPageView;
import kr.co.cms.domain.mypage.repository.EmplInfoRepository;
import kr.co.cms.domain.mypage.repository.MyPageRepository;
import kr.co.cms.domain.mypage.repository.StdInfoRepository;
import kr.co.cms.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final StdInfoRepository stdInfoRepository;
    private final EmplInfoRepository emplInfoRepository;
    private final DeptInfoRepository deptInfoRepository;
    private final MyPageRepository myPageRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    
    // 로그인
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: userId = {}", request.getId());
        
        // 1. 사용자 인증
        User user = userRepository.findByUserId(request.getId());
        if (user == null) {
            throw new RuntimeException("존재하지 않는 사용자입니다: " + request.getId());
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다");
        }
        
        // 2. 사용자 상태 확인
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("비활성화된 계정입니다");
        }
        
        // 3. 통합 뷰에서 사용자 정보 조회 (이름 + 학번/사번)
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(request.getId())
                .orElseThrow(() -> new RuntimeException("사용자 상세 정보를 찾을 수 없습니다: " + request.getId()));
        
        // 4. 사용자 역할 조회 (실제로는 USER_ROLES 테이블에서)
        String role = getUserRole(request.getId());
        
        // 5. JWT 토큰 생성 (아이디, 이름, 권한 포함)
        String accessToken = jwtUtil.generateAccessToken(
            user.getUserId(),              // USER_ID (로그인 ID)
            role,                          // 권한
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo()     // 학번/사번
        );
        
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
        
        // 6. Refresh Token 저장 (실제로는 DB에 저장)
        // saveRefreshToken(user.getUserId(), refreshToken);
        
        log.info("로그인 성공: userId = {}, name = {}, role = {}, idNo = {}", 
                user.getUserId(), userInfo.getUserName(), role, userInfo.getIdentifierNo());
        
        // 7. 새로운 생성자 사용하여 응답 생성
        return new LoginResponse(
            accessToken,
            refreshToken,
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo(),    // 학번/사번
            "로그인 성공"
        );
    }
    
    // 토큰 갱신
    public LoginResponse refreshToken(RefreshRequest request) {
        log.info("토큰 갱신 요청");
        
        // 1. Refresh Token 검증
        if (!jwtUtil.isValidToken(request.getRefreshToken())) {
            throw new RuntimeException("유효하지 않은 Refresh Token입니다");
        }
        
        // 2. Refresh Token에서 사용자 ID 추출
        String userId = jwtUtil.getUserId(request.getRefreshToken());
        
        // 3. 사용자 정보 다시 조회
        User user = userRepository.findByUserId(userId);
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("사용자 계정이 비활성화되었습니다");
        }
        
        // 4. 통합 뷰에서 최신 사용자 정보 조회
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 상세 정보를 찾을 수 없습니다: " + userId));
        
        // 5. 사용자 역할 조회
        String role = getUserRole(userId);
        
        // 6. 새로운 Access Token 생성
        String newAccessToken = jwtUtil.generateAccessToken(
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo()     // 학번/사번
        );
        
        log.info("토큰 갱신 성공: userId = {}, name = {}", userId, userInfo.getUserName());
        
        // 7. 새로운 생성자 사용하여 응답 생성
        return new LoginResponse(
            newAccessToken,
            request.getRefreshToken(), // 기존 Refresh Token 유지
            user.getUserId(),
            role,
            userInfo.getUserName(),        // 이름
            userInfo.getIdentifierNo(),    // 학번/사번
            "토큰 갱신 성공"
        );
    }
    
    // 로그아웃
    public void logout(String userId) {
        log.info("로그아웃: userId = {}", userId);
        // TODO: Refresh Token DB에서 삭제
    }
    
    // 등록된 사용자 생성 (학생, 상담사, 교수, 관리자)
    @Transactional
    public CreateUserResponse createRegisteredUser(CreateRegisteredUserRequest request) {
        log.info("사용자 생성 시작: userId = {}, roleType = {}", request.getUserId(), request.getRoleType());
        
        try {
            // 1. 기본 검증
            validateCreateUserRequest(request);
            
            // 2. USER_ACCOUNT 생성
            User user = createUserAccount(request);
            
            // 3. USER_ROLES 생성
            UserRole userRole = createUserRole(request);
            
            // 4. 역할별 개인정보 생성
            String identifierNo = createUserProfile(request);
            
            log.info("사용자 생성 완료: userId = {}, roleType = {}, identifierNo = {}", 
                    request.getUserId(), request.getRoleType(), identifierNo);
            
            return CreateUserResponse.builder()
                .success(true)
                .message("사용자 생성 성공")
                .userId(request.getUserId())
                .roleType(request.getRoleType())
                .identifierNo(identifierNo)
                .name(request.getName())
                .build();
                
        } catch (Exception e) {
            log.error("사용자 생성 실패: userId = {}, error = {}", request.getUserId(), e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }
    
    // 요청 데이터 검증
    private void validateCreateUserRequest(CreateRegisteredUserRequest request) {
        // 필수 필드 검증
        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            throw new RuntimeException("사용자 ID는 필수입니다");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("비밀번호는 필수입니다");
        }
        if (request.getRoleType() == null || request.getRoleType().trim().isEmpty()) {
            throw new RuntimeException("역할은 필수입니다");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("이름은 필수입니다");
        }
        if (request.getDeptCode() == null || request.getDeptCode().trim().isEmpty()) {
            throw new RuntimeException("학과코드는 필수입니다");
        }
        
        // 역할 타입 검증
        List<String> validRoles = Arrays.asList("STUDENT", "COUNSELOR", "PROFESSOR", "ADMIN");
        if (!validRoles.contains(request.getRoleType().toUpperCase())) {
            throw new RuntimeException("유효하지 않은 역할입니다: " + request.getRoleType());
        }
        
        // 사용자 ID 중복 검증
        if (userRepository.findByUserId(request.getUserId()) != null) {
            throw new RuntimeException("이미 존재하는 사용자 ID입니다: " + request.getUserId());
        }
        
        // 학과 코드 유효성 검증
        if (!deptInfoRepository.existsById(request.getDeptCode())) {
            throw new RuntimeException("존재하지 않는 학과코드입니다: " + request.getDeptCode());
        }
        
        // 역할별 필수 필드 검증
        if ("STUDENT".equals(request.getRoleType().toUpperCase())) {
            if (request.getStudentNo() == null || request.getStudentNo().trim().isEmpty()) {
                throw new RuntimeException("학생의 경우 학번은 필수입니다");
            }
            // 학번 중복 검증
            if (stdInfoRepository.findByStdNo(request.getStudentNo()).isPresent()) {
                throw new RuntimeException("이미 존재하는 학번입니다: " + request.getStudentNo());
            }
        } else {
            // 교직원의 경우
            if (request.getEmployeeNo() == null || request.getEmployeeNo().trim().isEmpty()) {
                throw new RuntimeException("교직원의 경우 사번은 필수입니다");
            }
            // 사번 중복 검증
            if (emplInfoRepository.findByEmplNo(request.getEmployeeNo()).isPresent()) {
                throw new RuntimeException("이미 존재하는 사번입니다: " + request.getEmployeeNo());
            }
        }
    }
    
    // 사용자 계정 생성
    private User createUserAccount(CreateRegisteredUserRequest request) {
        User user = new User();
        user.setUserId(request.getUserId());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    // 사용자 역할 생성
    private UserRole createUserRole(CreateRegisteredUserRequest request) {
        UserRole userRole = new UserRole();
        userRole.setUserId(request.getUserId());
        userRole.setRoleType(request.getRoleType().toUpperCase());
        
        return userRoleRepository.save(userRole);
    }
    
    // 사용자 프로필 생성 (역할별)
    private String createUserProfile(CreateRegisteredUserRequest request) {
        String roleType = request.getRoleType().toUpperCase();
        
        if ("STUDENT".equals(roleType)) {
            return createStudentInfo(request);
        } else {
            return createEmployeeInfo(request);
        }
    }
    
    // 학생 정보 생성
    private String createStudentInfo(CreateRegisteredUserRequest request) {
        StdInfo stdInfo = StdInfo.builder()
                .stdNo(request.getStudentNo())
                .stdNm(request.getName())
                .deptCd(request.getDeptCode())
                .schYr(request.getGradeYear())
                .entrDt(request.getEnterDate())
                .stdStatCd(request.getStatusCode() != null ? request.getStatusCode() : "ACTIVE")
                .postalCode(request.getPostalCode())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .userId(request.getUserId())
                .build();
        
        stdInfoRepository.save(stdInfo);
        return request.getStudentNo();
    }
    
    // 교직원 정보 생성
    private String createEmployeeInfo(CreateRegisteredUserRequest request) {
        EmplInfo emplInfo = EmplInfo.builder()
                .emplNo(request.getEmployeeNo())
                .emplNm(request.getName())
                .deptCd(request.getDeptCode())
                .stdStatCd(request.getStatusCode() != null ? request.getStatusCode() : "ACTIVE")
                .postalCode(request.getPostalCode())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .userId(request.getUserId())
                .build();
        
        emplInfoRepository.save(emplInfo);
        return request.getEmployeeNo();
    }
    
    // 사용자 역할 조회 (토큰에서 조회)
    private String getUserRole(String userId) {
        UnifiedMyPageView userInfo = myPageRepository.findByUserId(userId).orElse(null);
        if (userInfo != null && userInfo.getUserType() != null) {
            return userInfo.getUserType();
        }
        return ""; 
    }
}