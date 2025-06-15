package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String userId;
    private String password;
    private String accountStatus;
}