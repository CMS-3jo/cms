package kr.co.cms.global.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "spring.social")
public class SocialProperties {
    
    private OAuth kakao = new OAuth();
    private OAuth google = new OAuth();
    private OAuth naver = new OAuth();
    
    @Data
    public static class OAuth {
        private String clientId;
        private String clientSecret;
        private String redirectUri;
    }
}