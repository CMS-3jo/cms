package kr.co.cms.domain.cnsl.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cnsl.dto.CounselingApplyRequest;
import kr.co.cms.domain.cnsl.dto.CounselingDetailDto;
import kr.co.cms.domain.cnsl.dto.CounselingListResponse;
import kr.co.cms.domain.cnsl.dto.CounselingRecordDto;
import kr.co.cms.domain.cnsl.dto.CounselingSearchCondition;
import kr.co.cms.domain.cnsl.service.CounselingRecordService;
import kr.co.cms.domain.cnsl.service.CounselingScheduleService;
import kr.co.cms.domain.cnsl.service.CounselingService;
import kr.co.cms.domain.dept.repository.DeptInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/counseling")
public class CounselingController {
	
    private final CounselingService counselingService;
    private final CounselingRecordService counselingRecordService;
    private final CounselingScheduleService scheduleService;
    
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody CounselingApplyRequest request) {
        String id = counselingService.registerCounseling(request);
        return ResponseEntity.ok(Map.of("cnslAplyId", id));
    }
    
    @GetMapping("/applications")
    public ResponseEntity<?> getCounselingList(
    	    @RequestParam(name = "page", defaultValue = "0") int page,
    	    @RequestParam(name = "size", defaultValue = "10") int size,
    	    @RequestParam(name = "status", required = false) String status,
    	    @RequestParam(name = "search", required = false) String search) {
        CounselingSearchCondition condition = new CounselingSearchCondition();
        condition.setStatus(status);
        condition.setSearch(search);

        Pageable pageable = PageRequest.of(page, size, Sort.by("applyDate").descending());

        Page<CounselingListResponse> result = counselingService.getCounselingList(condition, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", Map.of(
            "items", result.getContent(),
            "totalCount", result.getTotalElements(),
            "totalPages", result.getTotalPages()
        ));

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/reserved-times")
    public List<String> getReservedTimes(@RequestParam("date") String date) {
        return counselingService.getReservedTimes(date);
    }
    
    @PatchMapping("/applications/{id}/assign")
    public ResponseEntity<?> assignCounselor(
        @PathVariable("id") String cnslAplyId,
        @RequestBody Map<String, String> payload
    ) {
        String empNo = payload.get("empNo");

        counselingService.assignCounselor(cnslAplyId, empNo);
        return ResponseEntity.ok(Map.of("success", true));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CounselingDetailDto> getCounselingDetail(@PathVariable("id") String id) {
        CounselingDetailDto dto = counselingService.getCounselingDetail(id);
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/schedule/exists/{emplNo}")
    public ResponseEntity<?> checkScheduleExists(@PathVariable("emplNo") String emplNo) {
        boolean exists = scheduleService.hasSchedule(emplNo);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
    
    @GetMapping("/records/{cnslAplyId}")
    public ResponseEntity<List<CounselingRecordDto>> getRecords(@PathVariable("cnslAplyId") String cnslAplyId) {
        List<CounselingRecordDto> records = counselingRecordService.getRecordsByApplyId(cnslAplyId);
        if (records.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(records);
    }

    @PostMapping("/records/{cnslAplyId}")
    public ResponseEntity<?> saveRecord(@PathVariable("cnslAplyId") String cnslAplyId,
                                        @RequestBody CounselingRecordDto dto) {
        counselingRecordService.saveCounselingRecord(cnslAplyId, dto);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
