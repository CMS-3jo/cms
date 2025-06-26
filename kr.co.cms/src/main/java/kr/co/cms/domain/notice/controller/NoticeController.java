package kr.co.cms.domain.notice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.service.NoticeService;
import kr.co.cms.global.file.dto.FileInfoDTO;
import kr.co.cms.global.file.dto.FileUploadResponseDTO;
import kr.co.cms.global.util.TokenUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService service;
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

        String id = service.createWithFiles(dto, files);

        return ResponseEntity.ok(Map.of(
                "noticeId", id,
                "message", "공지사항과 파일이 성공적으로 등록되었습니다."));
    }
    
    /**
     * 공지사항 수정 (파일 포함)
     */
    @PutMapping("/{id}/with-files")
    public ResponseEntity<Map<String, String>> updateWithFiles(
            @PathVariable("id") String id,
            @RequestPart("notice") NoticeDto dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request) {

        String userId = tokenUtil.getUserIdFromRequest(request);
        dto.setRegUserId(userId);

        service.updateWithFiles(id, dto, files);

        return ResponseEntity.ok(Map.of(
                "noticeId", id,
                "message", "공지사항이 수정되었습니다."));
    }
    /**
     * 공지사항 첨부파일 목록 조회
     */
    @GetMapping("/{id}/files")
    public ResponseEntity<List<FileInfoDTO>> getFiles(@PathVariable("id") String id) {
        return ResponseEntity.ok(service.getNoticeFiles(id));
    }

    /**
     * 공지사항 첨부파일 업로드
     */
    @PostMapping("/{id}/files")
    public ResponseEntity<List<FileUploadResponseDTO>> uploadFiles(
            @PathVariable("id") String id,
            @RequestPart("files") List<MultipartFile> files,
            HttpServletRequest request) {
        String userId = tokenUtil.getUserIdFromRequest(request);
        return ResponseEntity.ok(service.uploadNoticeFiles(id, files, userId));
    }

    /**
     * 공지사항 첨부파일 삭제
     */
    @DeleteMapping("/{id}/files/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable("id") String id,
            @PathVariable("fileId") Long fileId,
            HttpServletRequest request) {
        String userId = tokenUtil.getUserIdFromRequest(request);
        service.deleteNoticeFile(id, fileId, userId);
        return ResponseEntity.ok(Map.of("message", "파일이 삭제되었습니다."));
    }

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable("id") String id,
                                                      HttpServletRequest request) {
        String userId = tokenUtil.getUserIdFromRequest(request);
        service.delete(id, userId);
        return ResponseEntity.ok(Map.of(
                "noticeId", id,
                "message", "공지사항이 삭제되었습니다."));
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(@PathVariable("id") String id,
                                                      @RequestBody NoticeDto dto) {
        service.update(id, dto);
        return ResponseEntity.ok(Map.of("noticeId", id));
    }
}