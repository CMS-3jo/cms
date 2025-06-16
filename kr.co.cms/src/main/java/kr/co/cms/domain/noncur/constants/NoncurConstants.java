package kr.co.cms.domain.noncur.constants;

/**
 * 비교과 프로그램 관련 상수 클래스
 */
public class NoncurConstants {
    
    /**
     * 프로그램 상태 코드 상수
     */
    public static class ProgramStatus {
        public static final String RECRUITING = "01";        // 모집중
        public static final String DEADLINE_SOON = "02";     // 마감임박
        public static final String RECRUITMENT_CLOSED = "03"; // 모집완료
        public static final String IN_PROGRESS = "04";       // 운영중
        public static final String COMPLETED = "05";         // 종료
    }
    
    /**
     * 상태코드를 한글명으로 변환하는 유틸리티 메서드
     * @param statusCode 상태코드 (01, 02, 03, 04, 05)
     * @return 상태명 (한글)
     */
    public static String getStatusName(String statusCode) {
        if (statusCode == null) {
            return "알 수 없음";
        }
        
        switch (statusCode) {
            case ProgramStatus.RECRUITING:
                return "모집중";
            case ProgramStatus.DEADLINE_SOON:
                return "마감임박";
            case ProgramStatus.RECRUITMENT_CLOSED:
                return "모집완료";
            case ProgramStatus.IN_PROGRESS:
                return "운영중";
            case ProgramStatus.COMPLETED:
                return "종료";
            default:
                return "알 수 없음";
        }
    }
}