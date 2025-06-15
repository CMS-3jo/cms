package kr.co.cms.domain.auth.dto;

import lombok.Data;

@Data
public class UserResponse {
    private String userId;
    private String accountStatus;
    
    public UserResponse(String userId, String accountStatus) {
        this.userId = userId;
        this.accountStatus = accountStatus;
    }
}