package kr.co.cms.domain.notice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import kr.co.cms.domain.notice.entity.Notice;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, String> {
}