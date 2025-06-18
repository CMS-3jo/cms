package kr.co.cms.domain.notice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "NOTICE")
@Getter
@Setter
@NoArgsConstructor
public class Notice {
    @Id
    @Column(name = "NOTICE_ID", length = 20)
    private String noticeId;

    @Column(name = "TITLE", length = 500, nullable = false)
    private String title;

    @Column(name = "CONTENT", columnDefinition = "CLOB")
    private String content;
    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;

    @Column(name = "VIEW_CNT")
    private Integer viewCnt = 0;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @Column(name = "UPD_DT")
    private LocalDateTime updDt;

    @PrePersist
    protected void onCreate() {
        regDt = LocalDateTime.now();
        updDt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updDt = LocalDateTime.now();
    }
}