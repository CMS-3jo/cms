package kr.co.cms.global.file.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileInfoDTO {
    private Long fileId;
    private String refType;
    private String refId;
    private String fileCategory;
    private String fileCategoryName; // 공통코드에서 조회한 카테고리명
    private String fileNmOrig;
    private Long fileSize;
    private String fileExt;
    private Integer sortOrder;
    private LocalDateTime regDt;
    private String downloadUrl; // 다운로드 URL
}
