package kr.co.cms.domain.noncur.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.entity.NoncurApplication;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.domain.noncur.repository.NoncurApplicationRepository;
import kr.co.cms.domain.mypage.repository.EmplInfoRepository;
import kr.co.cms.domain.mypage.entity.EmplInfo;

@Service
@Transactional(readOnly = true)
public class SimplePermissionService {
    
    private final NoncurRepository programRepository;
    private final NoncurApplicationRepository applicationRepository;
    private final EmplInfoRepository emplInfoRepository;
    
    public SimplePermissionService(NoncurRepository programRepository, 
                                  NoncurApplicationRepository applicationRepository,
                                  EmplInfoRepository emplInfoRepository) {
        this.programRepository = programRepository;
        this.applicationRepository = applicationRepository;
        this.emplInfoRepository = emplInfoRepository;
    }
    

    //프로그램 관리 권한 체크
    public boolean hasPermissionForProgram(String userId, String prgId) {
        try {
            // 1. 시스템 관리자 체크
            if (isSystemAdmin(userId)) {
                return true;
            }
            
            // 2. 프로그램 정보 조회
            NoncurProgram program = programRepository.findById(prgId).orElse(null);
            if (program == null) {
                throw new IllegalArgumentException("프로그램을 찾을 수 없습니다: " + prgId);
            }
            
            // 3. 사용자 정보 조회
            EmplInfo emplInfo = emplInfoRepository.findByUserId(userId).orElse(null);
            if (emplInfo == null) {
                throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다: " + userId);
            }
            
            // 4. 본인이 등록한 프로그램인지 확인
            if (userId.equals(program.getRegUserId())) {
                return true;
            }
            
            // 5. 같은 부서 소속인지 확인 (엄격하게)
            if (emplInfo.getDeptCd() != null && emplInfo.getDeptCd().equals(program.getPrgDeptCd())) {
                return true;
            }
            
            // 6. 권한 없음
            return false;
            
        } catch (Exception e) {
            System.err.println("권한 체크 중 오류 발생: " + e.getMessage());
            return false; // 오류 시 권한 없음으로 처리
        }
    }
    

    //신청자 관리 권한 체크 (강화)
    public boolean hasApplicationPermission(String userId, String aplyId) {
        try {
            // 신청 정보로부터 프로그램 ID를 가져와서 권한 확인
            NoncurApplication application = applicationRepository.findById(aplyId).orElse(null);
            if (application == null) {
                throw new IllegalArgumentException("신청 정보를 찾을 수 없습니다: " + aplyId);
            }
            
            return hasPermissionForProgram(userId, application.getPrgId());
            
        } catch (Exception e) {
            System.err.println("신청 권한 체크 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
    
    //부서 권한 체크
    public boolean hasPermissionForDepartment(String userId, String deptCd) {
        try {
            // 1. 시스템 관리자 체크
            if (isSystemAdmin(userId)) {
                return true;
            }
            
            // 2. 해당 부서 소속인지 확인
            EmplInfo emplInfo = emplInfoRepository.findByUserId(userId).orElse(null);
            if (emplInfo == null) {
                throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다: " + userId);
            }
            
            return emplInfo.getDeptCd() != null && emplInfo.getDeptCd().equals(deptCd);
            
        } catch (Exception e) {
            System.err.println("부서 권한 체크 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
    
    //사용자의 부서 코드 조회
    public String getUserDepartment(String userId) {
        try {
            EmplInfo emplInfo = emplInfoRepository.findByUserId(userId).orElse(null);
            return emplInfo != null ? emplInfo.getDeptCd() : null;
        } catch (Exception e) {
            System.err.println("사용자 부서 조회 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
    

     //사용자 정보 조회
    public EmplInfo getUserInfo(String userId) {
        try {
            return emplInfoRepository.findByUserId(userId).orElse(null);
        } catch (Exception e) {
            System.err.println("사용자 정보 조회 중 오류 발생: " + e.getMessage());
            return null;
        }
    }
    

    //프로그램 존재 여부 확인
    public boolean programExists(String prgId) {
        try {
            return programRepository.existsById(prgId);
        } catch (Exception e) {
            System.err.println("프로그램 존재 여부 확인 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
    

    //신청 존재 여부 확인
    public boolean applicationExists(String aplyId) {
        try {
            return applicationRepository.existsById(aplyId);
        } catch (Exception e) {
            System.err.println("신청 존재 여부 확인 중 오류 발생: " + e.getMessage());
            return false;
        }
    }
    

     //시스템 관리자 여부 확인
    private boolean isSystemAdmin(String userId) {
        // TODO: 실제 시스템 관리자 체크 로직
        // 예: USER_ACCOUNT 테이블의 ROLE이 'ADMIN'인지 확인
        // 또는 EmplInfo의 직급/권한 정보를 확인
        
        if ("admin".equals(userId) || "system".equals(userId)) {
            return true;
        }
        
        // 추가적으로 EmplInfo에서 관리자 권한 확인
        try {
            EmplInfo emplInfo = emplInfoRepository.findByUserId(userId).orElse(null);
            if (emplInfo != null) {
                // 예: 특정 직급이나 권한 코드가 있는 경우
                // return "ADMIN".equals(emplInfo.getPositionCode()) || "MANAGER".equals(emplInfo.getPositionCode());
            }
        } catch (Exception e) {
            System.err.println("관리자 권한 확인 중 오류 발생: " + e.getMessage());
        }
        
        return false; // 기본적으로 일반 사용자로 처리
    }
    

     //사용자의 권한 레벨 확인
    public String getUserPermissionLevel(String userId) {
        if (isSystemAdmin(userId)) {
            return "SYSTEM_ADMIN";
        }
        
        try {
            EmplInfo emplInfo = emplInfoRepository.findByUserId(userId).orElse(null);
            if (emplInfo != null) {
                // 부서 관리자인지 확인하는 로직 추가 가능
                // 예: 특정 직급이면 부서 관리자
                return "DEPT_USER";
            }
        } catch (Exception e) {
            System.err.println("권한 레벨 확인 중 오류 발생: " + e.getMessage());
        }
        
        return "GENERAL_USER";
    }
}