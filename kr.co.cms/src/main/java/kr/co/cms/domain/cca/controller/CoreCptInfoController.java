package kr.co.cms.domain.cca.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cca.dto.CoreCptInfoDto;
import kr.co.cms.domain.cca.dto.CoreCptQuestionDto;
import kr.co.cms.domain.cca.dto.CoreCptSurveyDto;
import kr.co.cms.domain.cca.service.CoreCptInfoService;
import kr.co.cms.domain.cca.service.CoreCptQstService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/core-cpt")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoreCptInfoController {

    private final CoreCptInfoService service;
    private final CoreCptQstService qstService;
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CoreCptSurveyDto dto) {
        service.registerSurvey(dto); // ✅ 핵심역량 + 문항 전체 등록
        return ResponseEntity.ok("등록 완료");
    }
    
    @GetMapping("/list")
    public ResponseEntity<List<CoreCptInfoDto>> getAllSurveys() {
        List<CoreCptInfoDto> list = service.getAll();
        return ResponseEntity.ok(list);
    }
    @GetMapping("/{cciId}/questions")
    public ResponseEntity<List<CoreCptQuestionDto>> getQuestionsByCciId(
        @PathVariable("cciId") String cciId   // ← 이름을 명시
    ) {
        List<CoreCptQuestionDto> questions = qstService.getQuestionsByCciId(cciId);
        return ResponseEntity.ok(questions);
    }
}