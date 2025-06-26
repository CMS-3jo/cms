package kr.co.cms.domain.notice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.entity.Notice;
import kr.co.cms.domain.notice.repository.NoticeRepository;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.dto.FileInfoDTO;
import kr.co.cms.global.file.service.FileService;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository repo;
    private final FileService fileService;
    
    public NoticeService(NoticeRepository repo, FileService fileService) {
        this.repo = repo;
        this.fileService = fileService;
    }

    public List<NoticeDto> getAll() {
        return repo.findAll(org.springframework.data.domain.Sort.by("regDt").descending())
                   .stream()
                   .map(n -> {
                       NoticeDto dto = NoticeDto.fromEntity(n);
                       List<FileInfoDTO> files = fileService.getFileList(
                               FileConstants.RefType.NOTICE,
                               n.getNoticeId(),
                               FileConstants.Category.ATTACH);
                       dto.setFiles(files);
                       return dto;
                   })
                   .collect(Collectors.toList());
    }
    @Transactional
    public NoticeDto get(String noticeId) {
        return repo.findById(noticeId)
        		   .map(n -> {
                       n.setViewCnt(n.getViewCnt() + 1);
                       NoticeDto dto = NoticeDto.fromEntity(n);
                       List<FileInfoDTO> files = fileService.getFileList(
                               FileConstants.RefType.NOTICE,
                               n.getNoticeId(),
                               FileConstants.Category.ATTACH);
                       dto.setFiles(files);
                       return dto;
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
    /**
     * 공지사항과 첨부파일 등록
     */
    @Transactional
    public String createWithFiles(NoticeDto dto, List<MultipartFile> files) {
        String id = create(dto);

        if (files != null && !files.isEmpty()) {
            fileService.uploadFiles(
                files,
                FileConstants.RefType.NOTICE,
                id,
                FileConstants.Category.ATTACH,
                dto.getRegUserId()
            );
        }

        return id;
    }

    @Transactional
    public void update(String noticeId, NoticeDto dto) {
        Notice n = repo.findById(noticeId)
                       .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        n.setTitle(dto.getTitle());
        n.setContent(dto.getContent());
    }
    /**
     * 공지사항 수정 (파일 포함)
     */
    @Transactional
    public void updateWithFiles(String noticeId, NoticeDto dto, List<MultipartFile> files) {
        update(noticeId, dto);

        // 기존 첨부파일 논리삭제
        fileService.deleteFilesByRef(
            FileConstants.RefType.NOTICE,
            noticeId,
            dto.getRegUserId()
        );

        // 새로운 파일 업로드
        if (files != null && !files.isEmpty()) {
            fileService.uploadFiles(
                files,
                FileConstants.RefType.NOTICE,
                noticeId,
                FileConstants.Category.ATTACH,
                dto.getRegUserId()
            );
        }
    }

    private String generateId() {
        return "NT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}