package kr.co.cms.domain.mileage.constants;

public class MileageConstants {
    
    /**
     * 마일리지 가감 코드
     */
    public static class MileageType {
        public static final String ADD = "01";        // 가산
        public static final String DEDUCT = "02";     // 차감
        public static final String ADJUSTMENT = "03"; // 조정
    }
    
    /**
     * 활동 유형 코드 (확장 가능)
     */
    public static class ActivityType {
        public static final String NONCURRICULAR = "NC";  // 비교과
        public static final String CLUB = "CL";           // 동아리
        public static final String VOLUNTEER = "VL";      // 봉사활동
        public static final String COMPETITION = "CP";    // 경진대회
    }
    
    /**
     * 가감코드를 한글명으로 변환
     */
    public static String getTypeName(String typeCode) {
        if (typeCode == null) {
            return "알 수 없음";
        }
        
        switch (typeCode) {
            case MileageType.ADD:
                return "가산";
            case MileageType.DEDUCT:
                return "차감";
            case MileageType.ADJUSTMENT:
                return "조정";
            default:
                return "알 수 없음";
        }
    }
}