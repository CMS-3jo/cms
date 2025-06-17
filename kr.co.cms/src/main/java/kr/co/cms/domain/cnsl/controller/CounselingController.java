package kr.co.cms.domain.cnsl.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cnsl.dto.CounselingApplyRequest;
import kr.co.cms.domain.cnsl.service.CounselingService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/counseling")
public class CounselingController {

    private final CounselingService counselingService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody CounselingApplyRequest request) {
        String id = counselingService.registerCounseling(request);
        return ResponseEntity.ok(Map.of("cnslAplyId", id));
    }
}
