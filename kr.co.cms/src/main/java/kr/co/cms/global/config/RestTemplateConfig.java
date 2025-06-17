package kr.co.cms.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
/*
RestTemplate
간단함: 복잡한 HTTP 코드를 한 줄로
자동 변환: JSON → Java 객체 자동 변환
에러 처리: HTTP 에러 자동 감지
Spring 통합: Spring과 잘 맞음
 */