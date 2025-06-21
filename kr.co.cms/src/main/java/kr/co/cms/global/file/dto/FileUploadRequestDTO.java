package kr.co.cms.global.file.dto;

import lombok.Data;
import java.time.LocalDateTime;


@Data
public class FileUploadRequestDTO {
    private String refType;
    private String refId;
    private String fileCategory;
    private String userId;
}