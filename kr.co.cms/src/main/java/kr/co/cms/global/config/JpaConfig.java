package kr.co.cms.global.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(
    basePackages = "kr.co.cms.domain.*.repository"
)
@EntityScan(
    basePackages = "kr.co.cms.domain.*.entity"
)
@EnableJpaAuditing				// JPA Auditing 기능 활성화
@EnableTransactionManagement	// 어노테이션 기반 트랜잭션 관리 활성화
public class JpaConfig {
    
}