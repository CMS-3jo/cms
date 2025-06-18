package kr.co.cms.domain.noncur.constants;

public class NoncurApplicationConstants {
    
    /**
     * 신청 상태 코드
     */
    public static class ApplicationStatus {
        public static final String APPLIED = "01";      // 신청완료
        public static final String APPROVED = "02";     // 승인
        public static final String REJECTED = "03";     // 거부
        public static final String CANCELLED = "04";    // 취소
        public static final String COMPLETED = "05";    // 이수완료
    }
    
    /**
     * 신청 구분 코드
     */
    public static class ApplicationType {
        public static final String GENERAL = "01";      // 일반신청
        public static final String PRIORITY = "02";     // 우선신청
        public static final String WAITING = "03";      // 대기신청
    }
    
    /**
     * 상태코드를 한글명으로 변환
     */
    public static String getStatusName(String statusCode) {
        if (statusCode == null) {
            return "알 수 없음";
        }
        
        switch (statusCode) {
            case ApplicationStatus.APPLIED:
                return "신청완료";
            case ApplicationStatus.APPROVED:
                return "승인";
            case ApplicationStatus.REJECTED:
                return "거부";
            case ApplicationStatus.CANCELLED:
                return "취소";
            case ApplicationStatus.COMPLETED:
                return "이수완료";
            default:
                return "알 수 없음";
        }
    }
    
    /**
     * 신청구분코드를 한글명으로 변환
     */
    public static String getTypeName(String typeCode) {
        if (typeCode == null) {
            return "일반신청";
        }
        
        switch (typeCode) {
            case ApplicationType.GENERAL:
                return "일반신청";
            case ApplicationType.PRIORITY:
                return "우선신청";
            case ApplicationType.WAITING:
                return "대기신청";
            default:
                return "일반신청";
        }
    }
}