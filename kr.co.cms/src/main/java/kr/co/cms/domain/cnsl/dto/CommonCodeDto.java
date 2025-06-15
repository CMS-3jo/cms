package kr.co.cms.domain.cnsl.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommonCodeDto {
    private String code;     // CD
    private String name;     // CD_NM
    private String desc;     // CD_DESC
}
