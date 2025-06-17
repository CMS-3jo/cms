package kr.co.cms.domain.cca.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cca.dto.CoreCptEvalRequestDto;
import kr.co.cms.domain.cca.service.CoreCptEvalService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/core-cpt")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CoreCptEvalController {

    private final CoreCptEvalService evalService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitSurvey(@RequestBody CoreCptEvalRequestDto dto) {
        evalService.submitAnswers(dto);
        return ResponseEntity.ok("설문 저장 완료");
    }
}