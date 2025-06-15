package kr.co.cms.domain.noncur.dto;

import lombok.Data;

@Data
public class NoncurSearchDTO {
	private String keyword;
	private String searchDeptCode;
    private String searchStatusCode; // 상태코드 (01, 02, 03, 04, 05)
	private int page = 0;
	private int size = 10;
	private String sortBy = "regDt";
	private String sortDir = "desc";
	
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isFirst;
    private boolean isLast;
}
