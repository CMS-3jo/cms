package kr.co.cms.global.file.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Data;

@Component
@ConfigurationProperties(prefix = "ftp")
@Data
public class FtpProperties {
    private String host;                   
    private int port = 21;                  
    private String username;               
    private String password;               
    private String basePath = ""; 
    private int connectionTimeout = 10000;
    private int socketTimeout = 10000;
}