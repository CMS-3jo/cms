package kr.co.cms.domain.mileage.controller;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.dto.ProgramMileageDTO;
import kr.co.cms.domain.mileage.dto.StudentMileageDTO;
import kr.co.cms.domain.mileage.service.MileageService;

@RestController
@RequestMapping("/api/mileage")
public class MileageController {
    
    private final MileageService mileageService;
    
    public MileageController(MileageService mileageService) {
        this.mileageService = mileageService;
    }
    
    /**
     * 프로그램 마일리지 설정
     */
    @PostMapping("/program/{prgId}")
    public ResponseEntity<?> setProgramMileage(
            @PathVariable("prgId") String prgId,
            @RequestParam BigDecimal mlgScore,
            @RequestParam String regUserId) {
        try {
            mileageService.setProgramMileage(prgId, mlgScore, regUserId);
            return ResponseEntity.ok(Map.of("message", "마일리지가 설정되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "마일리지 설정 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 마일리지 부여 (프로그램 이수완료 시)
     */
    @PostMapping("/award")
    public ResponseEntity<?> awardMileage(@RequestBody MileageAwardRequestDTO requestDTO) {
        try {
            mileageService.awardMileage(requestDTO);
            return ResponseEntity.ok(Map.of("message", "마일리지가 부여되었습니다."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "마일리지 부여 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 학생 마일리지 조회
     */
    @GetMapping("/student/{stdNo}")
    public ResponseEntity<StudentMileageDTO> getStudentMileage(@PathVariable("stdNo") String stdNo) {
        try {
            StudentMileageDTO mileage = mileageService.getStudentMileage(stdNo);
            return ResponseEntity.ok(mileage);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 프로그램 마일리지 조회
     */
    @GetMapping("/program/{prgId}")
    public ResponseEntity<ProgramMileageDTO> getProgramMileage(@PathVariable("prgId") String prgId) {
        try {
            ProgramMileageDTO mileage = mileageService.getProgramMileage(prgId);
            if (mileage == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(mileage);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}