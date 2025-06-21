package kr.co.cms.global.file.dto;

import lombok.Data;

@Data
public class FileUploadResponseDTO {
    private Long fileId;
    private String fileNmOrig;
    private Long fileSize;
    private String fileExt;
    private String message;
    private boolean success;
}