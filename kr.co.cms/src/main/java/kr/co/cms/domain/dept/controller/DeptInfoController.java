package kr.co.cms.domain.dept.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import kr.co.cms.domain.dept.dto.DeptInfoDto;
import kr.co.cms.domain.dept.service.DeptInfoService;

@RestController
@RequestMapping("/api/dept")
public class DeptInfoController {

    private final DeptInfoService service;

    public DeptInfoController(DeptInfoService service) {
        this.service = service;
    }

    /** 전체 조회 */
    @GetMapping
    public List<DeptInfoDto> getAll(@RequestParam(name = "type", defaultValue = "ALL") String type) {
        if ("ALL".equalsIgnoreCase(type)) {
            return service.getAll();
        }
        // type 파라미터로도 조회 가능
        return service.getByType(type.toUpperCase().charAt(0));
    }

    /** 학생만 조회 (S_) */
    @GetMapping("/students")
    public List<DeptInfoDto> getStudents() {
        return service.getByType('S');
    }

    /** 상담사만 조회 (C_) */
    @GetMapping("/counselors")
    public List<DeptInfoDto> getCounselors() {
        return service.getByType('C');
    }

    /** 교수만 조회 (P_) */
    @GetMapping("/professors")
    public List<DeptInfoDto> getProfessors() {
        return service.getByType('P');
    }

    /** 관리자만 조회 (A_) */
    @GetMapping("/admins")
    public List<DeptInfoDto> getAdmins() {
        return service.getByType('A');
    }
}
