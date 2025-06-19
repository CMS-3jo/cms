package kr.co.cms.domain.cnsl.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.cms.domain.cnsl.entity.CounselingResult;

public interface CounselingResultRepository extends JpaRepository<CounselingResult, String> {
	
}
