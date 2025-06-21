package kr.co.cms.global.file.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import kr.co.cms.global.file.entity.FileInfo;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {
    
    /**
     * 참조별 파일 목록 조회
     */
    List<FileInfo> findByRefTypeAndRefIdAndUseYnOrderBySortOrder(String refType, String refId, String useYn);
    
    /**
     * 참조별 + 카테고리별 파일 목록 조회
     */
    List<FileInfo> findByRefTypeAndRefIdAndFileCategoryAndUseYnOrderBySortOrder(
        String refType, String refId, String fileCategory, String useYn);
    
    /**
     * 파일 ID와 사용여부로 조회
     */
    Optional<FileInfo> findByFileIdAndUseYn(Long fileId, String useYn);
    
    /**
     * 참조별 파일 목록 조회 (사용여부 포함)
     */
    List<FileInfo> findByRefTypeAndRefIdAndUseYn(String refType, String refId, String useYn);
}