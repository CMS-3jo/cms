package kr.co.cms.domain.cnsl.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "CNSL_LOG")
@Builder
public class CounselingLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LOG_ID")
    private Long logId;

    @Column(name = "CNSL_APLY_ID")
    private String cnslAplyId;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "WRITER")
    private String writer;

    @Lob
    @Column(name = "CONTENT")
    private String content;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;
}
