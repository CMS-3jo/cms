package kr.co.cms.domain.noncur.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.domain.employee.repository.EmployeeRepository;
import kr.co.cms.domain.employee.entity.Employee;

@Service
@Transactional(readOnly = true)
public class SimplePermissionService {
    
    private final NoncurRepository programRepository;
    private final EmployeeRepository employeeRepository;
    
    public SimplePermissionService(NoncurRepository programRepository, 
                                  EmployeeRepository employeeRepository) {
        this.programRepository = programRepository;
        this.employeeRepository = employeeRepository;
    }
    
    /**
     * 프로그램 관리 권한 체크
     * @param userId 사용자 ID
     * @param prgId 프로그램 ID
     * @return 권한 여부
     */
    public boolean hasPermissionForProgram(String userId, String prgId) {
        // 1. 시스템 관리자 체크 (필요시)
        if (isSystemAdmin(userId)) {
            return true;
        }
        
        // 2. 프로그램 정보 조회
        NoncurProgram program = programRepository.findById(prgId).orElse(null);
        if (program == null) {
            return false;
        }
        
        // 3. 본인이 등록한 프로그램인지 확인
        if (userId.equals(program.getRegUserId())) {
            return true;
        }
        
        // 4. 같은 부서 소속인지 확인
        Employee employee = employeeRepository.findByUserId(userId).orElse(null);
        if (employee != null && employee.getDeptCd() != null) {
            return employee.getDeptCd().equals(program.getPrgDeptCd());
        }
        
        return false;
    }
    
    /**
     * 부서 프로그램 관리 권한 체크
     * @param userId 사용자 ID
     * @param deptCd 부서 코드
     * @return 권한 여부
     */
    public boolean hasPermissionForDepartment(String userId, String deptCd) {
        // 1. 시스템 관리자 체크
        if (isSystemAdmin(userId)) {
            return true;
        }
        
        // 2. 해당 부서 소속인지 확인
        Employee employee = employeeRepository.findByUserId(userId).orElse(null);
        if (employee != null && employee.getDeptCd() != null) {
            return employee.getDeptCd().equals(deptCd);
        }
        
        return false;
    }
    
    /**
     * 사용자의 부서 코드 조회
     * @param userId 사용자 ID
     * @return 부서 코드
     */
    public String getUserDepartment(String userId) {
        Employee employee = employeeRepository.findByUserId(userId).orElse(null);
        return employee != null ? employee.getDeptCd() : null;
    }
    
    /**
     * 시스템 관리자 여부 확인
     * @param userId 사용자 ID
     * @return 관리자 여부
     */
    private boolean isSystemAdmin(String userId) {
        // TODO: 실제 시스템 관리자 체크 로직
        // 예: USER_ACCOUNT 테이블의 ROLE이 'ADMIN'인지 확인
        return "admin".equals(userId); // 임시
    }
}