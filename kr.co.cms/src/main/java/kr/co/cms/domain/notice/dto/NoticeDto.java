package kr.co.cms.domain.notice.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import kr.co.cms.domain.notice.entity.Notice;

@Data
public class NoticeDto {
    private String noticeId;
    private String title;
    private String content;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private List<String> files;

    public static NoticeDto fromEntity(Notice entity) {
        NoticeDto dto = new NoticeDto();
        dto.setNoticeId(entity.getNoticeId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setRegDt(entity.getRegDt());
        dto.setUpdDt(entity.getUpdDt());
        return dto;
    }
}