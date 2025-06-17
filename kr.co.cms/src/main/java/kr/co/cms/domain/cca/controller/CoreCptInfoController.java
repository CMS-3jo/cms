package kr.co.cms.domain.cca.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.co.cms.domain.cca.dto.CoreCptInfoDto;
import kr.co.cms.domain.cca.dto.CoreCptQuestionDto;
import kr.co.cms.domain.cca.dto.CoreCptSurveyDto;
import kr.co.cms.domain.cca.service.CoreCptInfoService;
import kr.co.cms.domain.cca.service.CoreCptQstService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/core-cpt")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CoreCptInfoController {

    private final CoreCptInfoService service;
    private final CoreCptQstService    qstService;

    /** 1) 등록 (HTTP 201) */
    @PostMapping("/register")             // ← 여기 "/register" 추가
    public ResponseEntity<Void> createSurvey(
            @RequestBody CoreCptSurveyDto dto) {
        service.registerSurvey(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** 2) 전체 목록 조회 */
    @GetMapping("/list")
    public ResponseEntity<List<CoreCptInfoDto>> getAllSurveys() {
        List<CoreCptInfoDto> list = service.getAll();
        return ResponseEntity.ok(list);
    }

    /** 3) 설문 상세(설문+문항) 조회 */
    @GetMapping("/{cciId}")
    public ResponseEntity<CoreCptSurveyDto> getSurveyDetail(
            @PathVariable("cciId") String cciId) {
        CoreCptSurveyDto dto = service.getSurveyDetail(cciId);
        return ResponseEntity.ok(dto);
    }

    /** 4) 해당 설문 문항만 조회 */
    @GetMapping("/{cciId}/questions")
    public ResponseEntity<List<CoreCptQuestionDto>> getQuestionsByCciId(
            @PathVariable("cciId") String cciId) {
        List<CoreCptQuestionDto> questions = qstService.getQuestionsByCciId(cciId);
        return ResponseEntity.ok(questions);
    }

    /** 5) 수정 */
    @PutMapping("/{cciId}")
    public ResponseEntity<Void> updateSurvey(
            @PathVariable("cciId") String cciId,
            @RequestBody CoreCptSurveyDto dto) {
        service.updateSurvey(cciId, dto);
        return ResponseEntity.ok().build();
    }

    /** 6) 삭제 (HTTP 204) */
    @DeleteMapping("/{cciId}")
    public ResponseEntity<Void> deleteSurvey(
            @PathVariable("cciId") String cciId) {
        service.deleteSurvey(cciId);
        return ResponseEntity.noContent().build();
    }
}
