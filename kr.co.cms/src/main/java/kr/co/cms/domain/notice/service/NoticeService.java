package kr.co.cms.domain.notice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.entity.Notice;
import kr.co.cms.domain.notice.repository.NoticeRepository;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository repo;

    public NoticeService(NoticeRepository repo) {
        this.repo = repo;
    }

    public List<NoticeDto> getAll() {
        return repo.findAll(org.springframework.data.domain.Sort.by("regDt").descending())
                   .stream()
                   .map(NoticeDto::fromEntity)
                   .collect(Collectors.toList());
    }
    @Transactional
    public NoticeDto get(String noticeId) {
        return repo.findById(noticeId)
.map(n -> {
    n.setViewCnt(n.getViewCnt() + 1);
    return NoticeDto.fromEntity(n);
})
                   .orElse(null);
    }

    @Transactional
    public String create(NoticeDto dto) {
        Notice n = new Notice();
        n.setNoticeId(generateId());
        n.setTitle(dto.getTitle());
        n.setContent(dto.getContent());
        n.setRegUserId(dto.getRegUserId());
        repo.save(n);
        return n.getNoticeId();
    }

    @Transactional
    public void update(String noticeId, NoticeDto dto) {
        Notice n = repo.findById(noticeId)
                       .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        n.setTitle(dto.getTitle());
        n.setContent(dto.getContent());
    }

    private String generateId() {
        return "NT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}