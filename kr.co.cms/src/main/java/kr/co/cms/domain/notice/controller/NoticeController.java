package kr.co.cms.domain.notice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.service.NoticeService;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.util.TokenUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService service;
    private final FileService fileService;
    private final TokenUtil tokenUtil;
  

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
    /**
     * 공지사항 등록 (파일 포함)
     */
    @PostMapping("/with-files")
    public ResponseEntity<Map<String, String>> createWithFiles(
            @RequestPart("notice") NoticeDto dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request) {

        String userId = tokenUtil.getUserIdFromRequest(request);
        dto.setRegUserId(userId);

        String id = service.create(dto);

        if (files != null && !files.isEmpty()) {
            fileService.uploadFiles(files,
                    FileConstants.RefType.NOTICE,
                    id,
                    FileConstants.Category.ATTACH,
                    userId);
        }

        return ResponseEntity.ok(Map.of(
                "noticeId", id,
                "message", "공지사항과 파일이 성공적으로 등록되었습니다."));
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(@PathVariable("id") String id,
                                                      @RequestBody NoticeDto dto) {
        service.update(id, dto);
        return ResponseEntity.ok(Map.of("noticeId", id));
    }
}