// CreateUserResponse.java
package kr.co.cms.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserResponse {
    private boolean success;
    private String message;
    private String userId;
    private String roleType;
    private String identifierNo; // 학번 또는 사번
    private String name;
}