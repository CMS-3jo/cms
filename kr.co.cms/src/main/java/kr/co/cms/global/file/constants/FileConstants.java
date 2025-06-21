package kr.co.cms.global.file.constants;

public class FileConstants {
    
    /**
     * 공통코드 그룹
     */
    public static class CodeGroup {
        public static final String FILE_REF_TYPE = "FILE_REF_TYPE";
        public static final String FILE_CATEGORY = "FILE_CATEGORY";
    }
    
    /**
     * 파일 참조 타입
     */
    public static class RefType {
        public static final String NONCUR = "NONCUR";      // 비교과
        public static final String BOARD = "BOARD";        // 게시판
        public static final String NOTICE = "NOTICE";      // 공지사항
        public static final String CONSULT = "CONSULT";    // 상담
    }
    
    /**
     * 파일 카테고리
     */
    public static class Category {
        public static final String ATTACH = "ATTACH";           // 첨부파일
        public static final String THUMBNAIL = "THUMBNAIL";     // 썸네일
        public static final String APPLY = "APPLY"; // 신청서
        public static final String IMG = "IMG"; // 컨텐츠 이미지
        public static final String TEMP = "TEMP";               // 임시파일
    }
    
    /**
     * 파일 크기 제한 (바이트)
     */
    public static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    public static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    
    /**
     * 허용 확장자
     */
    public static final String[] ALLOWED_EXTENSIONS = {
        "jpg", "jpeg", "png", "gif", "bmp",  // 이미지
        "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", // 문서
        "txt", "hwp", "zip", "rar"           // 기타
    };
    
    /**
     * 이미지 확장자
     */
    public static final String[] IMAGE_EXTENSIONS = {
        "jpg", "jpeg", "png", "gif", "bmp"
    };
}