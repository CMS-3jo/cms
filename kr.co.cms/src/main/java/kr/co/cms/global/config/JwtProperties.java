package kr.co.cms.global.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {
    private String secret = "mySecretKey123456789012345678901234567890";
    private long accessExpiration = 1800000;     // 30분
    private long refreshExpiration = 2592000000L; // 30일
}