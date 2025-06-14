package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String role;
    private String message;
    
    public LoginResponse(String accessToken, String refreshToken, String userId, String role, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.role = role;
        this.message = message;
    }
}