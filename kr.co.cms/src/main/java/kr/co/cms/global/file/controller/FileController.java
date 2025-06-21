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
     * 파일 다운로드
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileId") Long fileId) {
        try {
            // 파일 정보 조회
            FileInfo fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }

            // FTP에서 파일 다운로드
            byte[] fileContent = fileService.downloadFileContent(fileId);
            if (fileContent == null) {
                return ResponseEntity.notFound().build();
            }

            // 리소스 생성
            ByteArrayResource resource = new ByteArrayResource(fileContent);

            // Content-Type 설정
            String contentType = getContentType(fileInfo.getFileExt());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(fileContent.length)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "inline; filename=\"" + fileInfo.getFileNmOrig() + "\"")
                    .body(resource);

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