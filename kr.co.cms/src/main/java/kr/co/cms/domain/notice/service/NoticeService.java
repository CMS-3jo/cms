package kr.co.cms.domain.notice.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import kr.co.cms.domain.notice.dto.NoticeDto;
import kr.co.cms.domain.notice.entity.Notice;
import kr.co.cms.domain.notice.dto.NoticeSearchDTO;
import kr.co.cms.domain.notice.repository.NoticeRepository;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.global.file.dto.FileInfoDTO;
import kr.co.cms.global.file.dto.FileUploadResponseDTO;
import kr.co.cms.global.file.entity.FileInfo;
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
    
    public Map<String, Object> getNoticesWithPagination(NoticeSearchDTO searchDTO) {
        int page = searchDTO.getPage() != null ? searchDTO.getPage() : 0;
        int size = searchDTO.getSize() != null ? searchDTO.getSize() : 10;
        Sort sort = Sort.by(Sort.Direction.fromString(searchDTO.getSortDir()), searchDTO.getSortBy());
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notice> noticePage = repo.findAll(pageable);

        List<NoticeDto> list = noticePage.getContent().stream()
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

        Map<String, Object> response = new HashMap<>();
        response.put("notices", list);
        response.put("totalElements", noticePage.getTotalElements());
        response.put("totalPages", noticePage.getTotalPages());
        response.put("currentPage", noticePage.getNumber());
        response.put("size", noticePage.getSize());
        response.put("hasNext", noticePage.hasNext());
        response.put("hasPrevious", noticePage.hasPrevious());
        response.put("isFirst", noticePage.isFirst());
        response.put("isLast", noticePage.isLast());

        return response;
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

    
    /**
     * 공지사항의 첨부파일 목록 조회
     */
    public List<FileInfoDTO> getNoticeFiles(String noticeId) {
        return fileService.getFileList(
            FileConstants.RefType.NOTICE,
            noticeId,
            FileConstants.Category.ATTACH
        );
    }

    /**
     * 공지사항에 파일 업로드
     */
    @Transactional
    public List<FileUploadResponseDTO> uploadNoticeFiles(String noticeId, List<MultipartFile> files, String userId) {
        return fileService.uploadFiles(
            files,
            FileConstants.RefType.NOTICE,
            noticeId,
            FileConstants.Category.ATTACH,
            userId
        );
    }

    /**
     * 공지사항 파일 삭제
     */
    @Transactional
    public void deleteNoticeFile(String noticeId, Long fileId, String userId) {
        FileInfo info = fileService.getFileInfo(fileId);
        if (info == null || !FileConstants.RefType.NOTICE.equals(info.getRefType()) || !noticeId.equals(info.getRefId())) {
            throw new IllegalArgumentException("파일을 찾을 수 없습니다.");
        }
        fileService.deleteFile(fileId, userId);
    }
    /**
     * 공지사항 파일 정보 조회
     */
    public FileInfoDTO getNoticeFileInfo(String noticeId, Long fileId) {
        FileInfo info = fileService.getFileInfo(fileId);
        if (info == null || !FileConstants.RefType.NOTICE.equals(info.getRefType()) || !noticeId.equals(info.getRefId())) {
            return null;
        }
        return fileService.getFileList(FileConstants.RefType.NOTICE, noticeId, FileConstants.Category.ATTACH)
                .stream()
                .filter(f -> f.getFileId().equals(fileId))
                .findFirst()
                .orElse(null);
    }

    /**
     * 공지사항 삭제
     */
    @Transactional
    public void delete(String noticeId, String userId) {
        if (!repo.existsById(noticeId)) {
            throw new IllegalArgumentException("공지사항을 찾을 수 없습니다.");
        }

        // 첨부파일 삭제
        fileService.deleteFilesByRef(
            FileConstants.RefType.NOTICE,
            noticeId,
            userId
        );

        repo.deleteById(noticeId);
    }


    private String generateId() {
        return "NT" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}