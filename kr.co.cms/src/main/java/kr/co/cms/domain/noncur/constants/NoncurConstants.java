package kr.co.cms.domain.noncur.constants;

/**
 * 비교과 프로그램 관련 상수 클래스
 */
public class NoncurConstants {
    
    /**
     * 프로그램 상태 코드 상수 (공통코드 테이블의 PRG_STAT_CD 그룹)
     */
    public static class ProgramStatus {
        public static final String RECRUITING = "01";        // 모집중
        public static final String DEADLINE_SOON = "02";     // 마감임박
        public static final String RECRUITMENT_CLOSED = "03"; // 모집완료
        public static final String IN_PROGRESS = "04";       // 운영중
        public static final String COMPLETED = "05";         // 종료
    }
    
    /**
     * 신청 상태 코드 상수 (공통코드 테이블의 APLY_STAT_CD 그룹)
     */
    public static class ApplicationStatus {
        public static final String APPLIED = "01";    // 신청완료
        public static final String APPROVED = "02";   // 승인
        public static final String REJECTED = "03";   // 거부
        public static final String CANCELLED = "04";  // 취소
        public static final String COMPLETED = "05";  // 이수완료
    }
    
    /**
     * 신청 구분 코드 상수 (공통코드 테이블의 APLY_SEL_CD 그룹)
     */
    public static class ApplicationType {
        public static final String GENERAL = "01";   // 일반신청
        public static final String PRIORITY = "02";  // 우선신청
        public static final String WAITING = "03";   // 대기신청
    }
}