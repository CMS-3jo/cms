package kr.co.cms.global.file.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import kr.co.cms.global.file.dto.*;
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.util.TokenUtil;
import lombok.RequiredArgsConstructor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    
    private final FileService fileService;
    private final TokenUtil tokenUtil;
    
    /**
     * 파일 업로드
     */
    @PostMapping("/upload")
    public ResponseEntity<List<FileUploadResponseDTO>> uploadFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("refType") String refType,
            @RequestParam("refId") String refId,
            @RequestParam("category") String category,
            HttpServletRequest request) {
        
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            List<FileUploadResponseDTO> result = fileService.uploadFiles(files, refType, refId, category, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    /**
     * 파일 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<List<FileInfoDTO>> getFileList(
            @RequestParam("refType") String refType,
            @RequestParam("refId") String refId,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            List<FileInfoDTO> files = fileService.getFileList(refType, refId, category);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    /**
     * 파일 삭제
     */
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable Long fileId,
            HttpServletRequest request) {
        
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            fileService.deleteFile(fileId, userId);
            return ResponseEntity.ok(Map.of("message", "파일이 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}