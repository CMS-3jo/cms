package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String role;
    private String name;            // 사용자 이름 추가
    private String identifierNo;    // 학번/사번 추가
    private String message;
    
    // 기존 생성자 (하위 호환성)
    public LoginResponse(String accessToken, String refreshToken, String userId, String role, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.role = role;
        this.message = message;
    }
    
    // 새로운 생성자 (이름, 학번/사번 포함)
    public LoginResponse(String accessToken, String refreshToken, String userId, String role, String name, String identifierNo, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.role = role;
        this.name = name;
        this.identifierNo = identifierNo;
        this.message = message;
    }
    
    // 기본 생성자
    public LoginResponse() {}
}