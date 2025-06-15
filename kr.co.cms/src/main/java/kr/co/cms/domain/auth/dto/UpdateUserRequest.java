package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String password;
    private String accountStatus;
}