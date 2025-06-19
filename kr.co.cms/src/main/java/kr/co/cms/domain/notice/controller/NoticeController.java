package kr.co.cms.domain.notice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.service.NoticeService;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "http://localhost:5173")
public class NoticeController {

    private final NoticeService service;

    public NoticeController(NoticeService service) {
        this.service = service;
    }

    @GetMapping
    public List<NoticeDto> list() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeDto> get(@PathVariable("id") String id) {
        NoticeDto dto = service.get(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> create(@RequestBody NoticeDto dto) {
        String id = service.create(dto);
        return ResponseEntity.ok(Map.of("noticeId", id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(@PathVariable("id") String id,
                                                      @RequestBody NoticeDto dto) {
        service.update(id, dto);
        return ResponseEntity.ok(Map.of("noticeId", id));
    }
}