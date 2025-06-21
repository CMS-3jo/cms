package kr.co.cms.global.file.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.util.FilePathGenerator;

import java.util.Arrays;

@Service
public class FileValidationService {
    
    private final FilePathGenerator pathGenerator;
    
    public FileValidationService(FilePathGenerator pathGenerator) {
        this.pathGenerator = pathGenerator;
    }
    
    /**
     * 파일 유효성 검증
     */
    public void validateFile(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        // 파일 크기 검증
        validateFileSize(file, category);
        
        // 확장자 검증
        validateFileExtension(file);
        
        // 파일명 검증
        validateFileName(file.getOriginalFilename());
    }
    
    /**
     * 파일 크기 검증
     */
    private void validateFileSize(MultipartFile file, String category) {
        long maxSize = FileConstants.MAX_FILE_SIZE;
        
        // 이미지 카테고리는 더 작은 제한
        if (FileConstants.Category.THUMBNAIL.equals(category) || 
            FileConstants.Category.IMG.equals(category)) {
            maxSize = FileConstants.MAX_IMAGE_SIZE;
        }
        
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(
                String.format("파일 크기가 제한을 초과했습니다. (최대: %dMB)", maxSize / 1024 / 1024));
        }
    }
    
    /**
     * 확장자 검증
     */
    private void validateFileExtension(MultipartFile file) {
        String extension = pathGenerator.getFileExtension(file.getOriginalFilename());
        
        if (extension.isEmpty()) {
            throw new IllegalArgumentException("파일 확장자가 없습니다.");
        }
        
        boolean isAllowed = Arrays.stream(FileConstants.ALLOWED_EXTENSIONS)
            .anyMatch(ext -> ext.equalsIgnoreCase(extension));
            
        if (!isAllowed) {
            throw new IllegalArgumentException(
                String.format("허용되지 않은 파일 확장자입니다: %s", extension));
        }
    }
    
    /**
     * 파일명 검증
     */
    private void validateFileName(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("파일명이 비어있습니다.");
        }
        
        if (filename.length() > 255) {
            throw new IllegalArgumentException("파일명이 너무 깁니다. (최대 255자)");
        }
    }
}