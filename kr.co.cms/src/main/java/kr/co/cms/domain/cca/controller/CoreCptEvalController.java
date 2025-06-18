package kr.co.cms.domain.cca.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.co.cms.domain.cca.dto.CcaCompScoreDto;
import kr.co.cms.domain.cca.dto.CcaScoreSummaryDto;
import kr.co.cms.domain.cca.dto.CoreCptEvalRequestDto;
import kr.co.cms.domain.cca.service.CcaScoreService;
import kr.co.cms.domain.cca.service.CoreCptEvalService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/core-cpt")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CoreCptEvalController {

    private final CoreCptEvalService evalService;
    private final CcaScoreService scoreService;

    /**
     * 설문 답안 제출
     * POST /api/core-cpt/submit
     */
    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> submitSurvey(@RequestBody CoreCptEvalRequestDto dto) {
        evalService.submitAnswers(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * 학생(stdNo)의 핵심역량별 점수 조회
     * GET /api/core-cpt/{cciId}/score?stdNo=학번
     */
    @GetMapping(value = "/{cciId}/score", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<CcaCompScoreDto>> getScores(
            @PathVariable("cciId") String cciId,
            @RequestParam("stdNo") String stdNo) {

        List<CcaCompScoreDto> scores = scoreService.calculateScores(stdNo, cciId);
        return ResponseEntity.ok(scores);
    }

    /**
     * 학생 점수와 평균, 추천 정보를 포함하여 반환
     * GET /api/core-cpt/{cciId}/summary?stdNo=학번
     */
    @GetMapping(value = "/{cciId}/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CcaScoreSummaryDto> getScoreSummary(
            @PathVariable("cciId") String cciId,
            @RequestParam("stdNo") String stdNo) {
        CcaScoreSummaryDto dto = scoreService.calculateScoreSummary(stdNo, cciId);
        return ResponseEntity.ok(dto);
    }
}
