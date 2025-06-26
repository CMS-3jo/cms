package kr.co.cms.global.file.dto;

import lombok.Data;

@Data
public class FileSortOrderUpdateDTO {
    private Long fileId;
    private Integer sortOrder;
}