package kr.co.cms.global.file.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import kr.co.cms.global.file.dto.*;
import kr.co.cms.global.file.entity.FileInfo;
import kr.co.cms.global.file.repository.FileInfoRepository;
import kr.co.cms.global.file.util.FtpUtil;
import kr.co.cms.global.file.util.FilePathGenerator;
import kr.co.cms.global.file.constants.FileConstants;
import kr.co.cms.domain.common.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class FileService {
    
    private final FileInfoRepository fileInfoRepository;
    private final FileValidationService validationService;
    private final FilePathGenerator pathGenerator;
    private final FtpUtil ftpUtil;
    private final CommonCodeService commonCodeService;
    
    /**
     * 파일 업로드
     */
    @Transactional
    public List<FileUploadResponseDTO> uploadFiles(
            List<MultipartFile> files,
            String refType,
            String refId,
            String category,
            String userId) {
        
        return files.stream()
            .map(file -> uploadSingleFile(file, refType, refId, category, userId))
            .collect(Collectors.toList());
    }
    
    /**
     * 단일 파일 업로드
     */
    @Transactional
    public FileUploadResponseDTO uploadSingleFile(
            MultipartFile file,
            String refType,
            String refId,
            String category,
            String userId) {
        
        try {
            // 1. 파일 검증
            validationService.validateFile(file, category);
            
            // 2. 공통코드 검증
            validateCommonCodes(refType, category);
            
            // 3. 파일 경로 생성
            String savedFileName = pathGenerator.generateSavedFileName(file.getOriginalFilename());
            String filePath = pathGenerator.generateFilePath(category, savedFileName);
            
            // 4. FTP 업로드
            boolean ftpSuccess = ftpUtil.uploadFile(filePath, file);
            if (!ftpSuccess) {
                throw new RuntimeException("FTP 업로드에 실패했습니다.");
            }
            
            // 5. DB 저장
            FileInfo fileInfo = new FileInfo();
            fileInfo.setRefType(refType);
            fileInfo.setRefId(refId);
            fileInfo.setFileCategory(category);
            fileInfo.setFileNmOrig(file.getOriginalFilename());
            fileInfo.setFileNmSaved(savedFileName);
            fileInfo.setFilePath(filePath);
            fileInfo.setFileSize(file.getSize());
            fileInfo.setFileExt(pathGenerator.getFileExtension(file.getOriginalFilename()));
            fileInfo.setRegUserId(userId);
            
            FileInfo saved = fileInfoRepository.save(fileInfo);
            
            // 6. 응답 DTO 생성
            FileUploadResponseDTO response = new FileUploadResponseDTO();
            response.setFileId(saved.getFileId());
            response.setFileNmOrig(saved.getFileNmOrig());
            response.setFileSize(saved.getFileSize());
            response.setFileExt(saved.getFileExt());
            response.setMessage("업로드 성공");
            response.setSuccess(true);
            
            return response;
            
        } catch (Exception e) {
            log.error("파일 업로드 실패: {}", e.getMessage(), e);
            
            FileUploadResponseDTO response = new FileUploadResponseDTO();
            response.setFileNmOrig(file.getOriginalFilename());
            response.setMessage("업로드 실패: " + e.getMessage());
            response.setSuccess(false);
            
            return response;
        }
    }
    
    /**
     * 파일 목록 조회
     */
    public List<FileInfoDTO> getFileList(String refType, String refId, String category) {
        List<FileInfo> files;
        
        if (category != null && !category.isEmpty()) {
            files = fileInfoRepository.findByRefTypeAndRefIdAndFileCategoryAndUseYnOrderBySortOrder(
                refType, refId, category, "Y");
        } else {
            files = fileInfoRepository.findByRefTypeAndRefIdAndUseYnOrderBySortOrder(
                refType, refId, "Y");
        }
        
        return files.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * 파일 삭제 (논리삭제)
     */
    @Transactional
    public void deleteFile(Long fileId, String userId) {
        FileInfo fileInfo = fileInfoRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
        
        fileInfo.setUseYn("N");
        fileInfoRepository.save(fileInfo);
        
        // 선택적으로 FTP에서도 실제 삭제
        // ftpUtil.deleteFile(fileInfo.getFilePath());
    }
    
    /**
     * 참조 데이터 삭제 시 관련 파일들 논리삭제
     */
    @Transactional
    public void deleteFilesByRef(String refType, String refId, String userId) {
        List<FileInfo> files = fileInfoRepository.findByRefTypeAndRefIdAndUseYn(refType, refId, "Y");
        
        files.forEach(file -> {
            file.setUseYn("N");
        });
        
        fileInfoRepository.saveAll(files);
    }
    
    /**
     * 공통코드 검증
     */
    private static final java.util.Set<String> DEFAULT_REF_TYPES = java.util.Set.of(
        FileConstants.RefType.NONCUR,
        FileConstants.RefType.BOARD,
        FileConstants.RefType.NOTICE,
        FileConstants.RefType.CONSULT,
        FileConstants.RefType.USER
    );

    private static final java.util.Set<String> DEFAULT_CATEGORIES = java.util.Set.of(
        FileConstants.Category.ATTACH,
        FileConstants.Category.THUMBNAIL,
        FileConstants.Category.APPLY,
        FileConstants.Category.IMG,
        FileConstants.Category.TEMP,
        FileConstants.Category.PROFILE
    );

    private void validateCommonCodes(String refType, String category) {
        // 참조 타입 검증
    	  List<kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL> refTypes =
            commonCodeService.getCodes(FileConstants.CodeGroup.FILE_REF_TYPE, null);
        
        boolean validRefType = refTypes.stream()
            .anyMatch(code -> code.getCode().equals(refType));
        if (!validRefType) {
            // 데이터베이스에 코드가 없을 수 있으므로 기본 상수 세트로 한번 더 확인
            validRefType = DEFAULT_REF_TYPES.contains(refType);
        }

        if (!validRefType) {
            throw new IllegalArgumentException("유효하지 않은 참조 타입입니다: " + refType);
        }
        
        // 카테고리 검증
        if (category != null) {
        	 List<kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL> categories =
                commonCodeService.getCodes(FileConstants.CodeGroup.FILE_CATEGORY, null);
            
            boolean validCategory = categories.stream()
                .anyMatch(code -> code.getCode().equals(category));

            if (!validCategory) {
                // 마찬가지로 기본 상수 세트 확인
                validCategory = DEFAULT_CATEGORIES.contains(category);
            }

            if (!validCategory) {
                throw new IllegalArgumentException("유효하지 않은 파일 카테고리입니다: " + category);
            }
        }
    }
    
    /**
     * Entity to DTO 변환
     */
    private FileInfoDTO convertToDTO(FileInfo fileInfo) {
        FileInfoDTO dto = new FileInfoDTO();
        dto.setFileId(fileInfo.getFileId());
        dto.setRefType(fileInfo.getRefType());
        dto.setRefId(fileInfo.getRefId());
        dto.setFileCategory(fileInfo.getFileCategory());
        dto.setFileNmOrig(fileInfo.getFileNmOrig());
        dto.setFileSize(fileInfo.getFileSize());
        dto.setFileExt(fileInfo.getFileExt());
        dto.setSortOrder(fileInfo.getSortOrder());
        dto.setRegDt(fileInfo.getRegDt());
        dto.setDownloadUrl("/api/files/" + fileInfo.getFileId() + "/download");
        
        // 공통코드에서 카테고리명 조회
        if (fileInfo.getFileCategory() != null) {
            List<kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL> categories = 
                commonCodeService.getCodes(FileConstants.CodeGroup.FILE_CATEGORY, null);
            
            categories.stream()
                .filter(code -> code.getCode().equals(fileInfo.getFileCategory()))
                .findFirst()
                .ifPresent(code -> dto.setFileCategoryName(code.getName()));
        }
        
        return dto;
    }
    
    /**
     * 파일 정보 조회
     */
    public FileInfo getFileInfo(Long fileId) {
        return fileInfoRepository.findByFileIdAndUseYn(fileId, "Y")
            .orElse(null);
    }

    /**
     * 파일 내용 다운로드
     */
    public byte[] downloadFileContent(Long fileId) {
        try {
            FileInfo fileInfo = getFileInfo(fileId);
            if (fileInfo == null) {
                return null;
            }

            // FTP에서 파일 다운로드
            return ftpUtil.downloadFile(fileInfo.getFilePath());
        } catch (Exception e) {
            log.error("파일 다운로드 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    /**
     * 파일 정렬 순서 업데이트
     */
    @Transactional
    public void updateFileSortOrders(List<FileSortOrderUpdateDTO> sortOrderList, String userId) {
        List<FileInfo> files = sortOrderList.stream()
            .map(dto -> {
                FileInfo info = fileInfoRepository.findById(dto.getFileId())
                    .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
                info.setSortOrder(dto.getSortOrder());
                info.setRegUserId(userId);
                return info;
            })
            .toList();

        fileInfoRepository.saveAll(files);
    }
}