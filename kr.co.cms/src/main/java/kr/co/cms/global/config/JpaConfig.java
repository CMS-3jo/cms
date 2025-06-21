package kr.co.cms.global.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(
	    basePackages = {
	            "kr.co.cms.domain.*.repository",    // 기존 도메인 리포지토리들
	            "kr.co.cms.global.*.repository"     // global 패키지 리포지토리들 추가
	        }

)
@EntityScan(
		basePackages = {
			        "kr.co.cms.domain.*.entity",        // 기존 도메인 엔티티들
			        "kr.co.cms.global.*.entity"         // global 패키지 엔티티들 추가
			    }
)
@EnableJpaAuditing				// JPA Auditing 기능 활성화
@EnableTransactionManagement	// @Transaction 어노테이션 기반 트랜잭션 관리 활성화
public class JpaConfig {
    
}