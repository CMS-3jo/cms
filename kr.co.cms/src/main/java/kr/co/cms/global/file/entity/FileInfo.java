package kr.co.cms.global.file.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "FILE_INFO")
@Getter
@Setter
@NoArgsConstructor
public class FileInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FILE_ID")
    private Long fileId;

    @Column(name = "REF_TYPE", length = 20, nullable = false)
    private String refType;

    @Column(name = "REF_ID", length = 50, nullable = false)
    private String refId;

    @Column(name = "FILE_CATEGORY", length = 20)
    private String fileCategory;

    @Column(name = "FILE_NM_ORIG", length = 255, nullable = false)
    private String fileNmOrig;

    @Column(name = "FILE_NM_SAVED", length = 255, nullable = false)
    private String fileNmSaved;

    @Column(name = "FILE_PATH", length = 500, nullable = false)
    private String filePath;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "FILE_EXT", length = 10)
    private String fileExt;

    @Column(name = "SORT_ORDER")
    private Integer sortOrder = 0;

    @Column(name = "USE_YN", length = 1)
    private String useYn = "Y";

    @Column(name = "REG_USER_ID", length = 20)
    private String regUserId;

    @Column(name = "REG_DT")
    private LocalDateTime regDt;

    @PrePersist
    protected void onCreate() {
        regDt = LocalDateTime.now();
    }
}