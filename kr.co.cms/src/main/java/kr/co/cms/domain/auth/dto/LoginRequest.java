package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String id;
    private String password;
    private String userType;
}