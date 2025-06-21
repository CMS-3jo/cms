package kr.co.cms.domain.notice.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import kr.co.cms.domain.notice.entity.Notice;
import kr.co.cms.global.file.dto.FileInfoDTO;

@Data
public class NoticeDto {
    private String noticeId;
    private String title;
    private String content;
    private String regUserId;
    private Integer viewCnt;
    private LocalDateTime regDt;
    private LocalDateTime updDt;
    private List<FileInfoDTO> files;

    public static NoticeDto fromEntity(Notice entity) {
        NoticeDto dto = new NoticeDto();
        dto.setNoticeId(entity.getNoticeId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setRegUserId(entity.getRegUserId());
        dto.setViewCnt(entity.getViewCnt());
        dto.setRegDt(entity.getRegDt());
        dto.setUpdDt(entity.getUpdDt());
        return dto;
    }
}