package kr.co.cms.global.file.util;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class FilePathGenerator {

    /**
     * 저장될 파일명 생성 - 날짜 + 난수 방식
     * 예: 20250621_235959_a1b2c3d4.pdf
     */
    public String generateSavedFileName(String originalFilename) {
        // 현재 시간 (yyyyMMdd_HHmmss)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        
        // 8자리 난수
        String randomId = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        
        // 확장자
        String extension = getFileExtension(originalFilename);
        
        // 확장자가 있으면 점(.)과 함께, 없으면 그냥 파일명만
        if (extension.isEmpty()) {
            return timestamp + "_" + randomId;
        } else {
            return timestamp + "_" + randomId + "." + extension;
        }
    }

    /**
     * 파일 저장 경로 생성 (/uploads/2025/06/21/CATEGORY/filename.ext)
     */
    public String generateFilePath(String category, String savedFileName) {
        String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("/uploads/%s/%s/%s", dateDir, category, savedFileName);
    }

    /**
     * 파일 확장자 추출
     */
    public String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ""; // 확장자 없음
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 확장자 제외한 파일명 (원본명 그대로 반환 - DB 저장용)
     */
    public String getBaseName(String filename) {
        if (filename == null || !filename.contains(".")) {
            return filename != null ? filename : "";
        }
        return filename.substring(0, filename.lastIndexOf("."));
    }

    /**
     * 하위 호환성을 위한 메서드들
     */
    public String sanitizeFileName(String filename) {
        return filename; // 더 이상 필요 없음
    }
}