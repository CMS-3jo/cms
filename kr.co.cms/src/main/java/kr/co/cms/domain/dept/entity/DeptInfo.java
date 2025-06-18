package kr.co.cms.domain.dept.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "DEPT_INFO")
public class DeptInfo {

    @Id
    @Column(name = "DEPT_CD", length = 20)
    private String deptCd;

    @Column(name = "DEPT_NM", length = 100)
    private String deptNm;

    public DeptInfo() {}

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
}
