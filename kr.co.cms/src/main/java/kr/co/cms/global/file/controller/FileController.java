package kr.co.cms.global.file.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import kr.co.cms.global.file.dto.*;
import kr.co.cms.global.file.entity.FileInfo;
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.util.TokenUtil;
import lombok.RequiredArgsConstructor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

    /**
     * 파일 정렬 순서 변경
     */
    @PutMapping("/sort-order")
    public ResponseEntity<Map<String, String>> updateSortOrder(
            @RequestBody List<FileSortOrderUpdateDTO> sortOrderList,
            HttpServletRequest request) {
        try {
            String userId = tokenUtil.getUserIdFromRequest(request);
            fileService.updateFileSortOrders(sortOrderList, userId);
            return ResponseEntity.ok(Map.of("message", "순서가 변경되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 파일 다운로드
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileId") Long fileId) {
        try {
            FileInfo fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = fileService.downloadFileContent(fileId);
            if (fileContent == null) {
                return ResponseEntity.notFound().build();
            }

            ByteArrayResource resource = new ByteArrayResource(fileContent);
            String contentType = getContentType(fileInfo.getFileExt());

            // 원본 파일명을 안전하게 처리
            String originalFileName = fileInfo.getFileNmOrig();
            String encodedFileName;
            
            try {
                // RFC 5987 표준에 따른 인코딩 (브라우저 호환성 좋음)
                encodedFileName = URLEncoder.encode(originalFileName, StandardCharsets.UTF_8)
                        .replaceAll("\\+", "%20");
                        
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .contentLength(fileContent.length)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename*=UTF-8''" + encodedFileName)
                        .body(resource);
                            
            } catch (Exception e) {
                // 인코딩 실패 시에만 안전한 파일명 사용
                String safeFileName = "file_" + fileId + "." + fileInfo.getFileExt();
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .contentLength(fileContent.length)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + safeFileName + "\"")
                        .body(resource);
            }

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 확장자에 따른 Content-Type 반환
     */
    private String getContentType(String fileExt) {
        if (fileExt == null) return "application/octet-stream";
        
        switch (fileExt.toLowerCase()) {
            case "png": return "image/png";
            case "jpg": case "jpeg": return "image/jpeg";
            case "gif": return "image/gif";
            case "bmp": return "image/bmp";
            case "pdf": return "application/pdf";
            case "doc": return "application/msword";
            case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls": return "application/vnd.ms-excel";
            case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "txt": return "text/plain";
            default: return "application/octet-stream";
        }
    }
}