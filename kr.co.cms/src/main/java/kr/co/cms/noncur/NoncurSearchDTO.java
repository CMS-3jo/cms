package kr.co.cms.noncur;

import lombok.Data;

@Data
public class NoncurSearchDTO {
	private String keyword;
	private String searchDeptCode;
	private String searchStatus;
	private int page = 0;
	private int size = 10;
	private String sortBy = "regDt";
	private String sortDir = "desc";
}
