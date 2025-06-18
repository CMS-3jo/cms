// src/main/java/kr/co/cms/domain/dept/dto/DeptInfoDto.java
package kr.co.cms.domain.dept.dto;

import kr.co.cms.domain.dept.entity.DeptInfo;

public class DeptInfoDto {

    private String deptCd;
    private String deptNm;

    public DeptInfoDto() {}

    public DeptInfoDto(String deptCd, String deptNm) {
        this.deptCd = deptCd;
        this.deptNm = deptNm;
    }

    public String getDeptCd() {
        return deptCd;
    }

    public void setDeptCd(String deptCd) {
        this.deptCd = deptCd;
    }

    public String getDeptNm() {
        return deptNm;
    }

    public void setDeptNm(String deptNm) {
        this.deptNm = deptNm;
    }

    // Entity → DTO 변환 헬퍼
    public static DeptInfoDto fromEntity(DeptInfo e) {
        return new DeptInfoDto(e.getDeptCd(), e.getDeptNm());
    }
}