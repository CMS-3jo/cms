package kr.co.cms.domain.notice.dto;

import lombok.Data;

@Data
public class NoticeSearchDTO {
    private Integer page;
    private Integer size;
    private String sortBy = "regDt";
    private String sortDir = "desc";
}