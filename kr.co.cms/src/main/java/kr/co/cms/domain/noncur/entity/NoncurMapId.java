package kr.co.cms.domain.noncur.entity;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class NoncurMapId implements Serializable {
    private String prgId;
    private String cciId;
}