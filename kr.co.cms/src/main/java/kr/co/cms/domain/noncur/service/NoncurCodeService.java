package kr.co.cms.domain.noncur.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import kr.co.cms.domain.common.service.CommonCodeService;
import kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL;

@Service
public class NoncurCodeService {
    
    private final CommonCodeService commonCodeService;
    private final Map<String, String> codeNameCache = new ConcurrentHashMap<>();
    
    public NoncurCodeService(CommonCodeService commonCodeService) {
        this.commonCodeService = commonCodeService;
        initializeCache();
    }
    
    /**
     * 캐시 초기화 - 앱 시작시 또는 주기적으로 호출
     */
    private void initializeCache() {
        try {
            // 프로그램 상태 코드
            List<CommonCodeDtoForCNSL> prgStatCodes = 
                commonCodeService.getCodes("PRG_STAT_CD", null);
            prgStatCodes.forEach(code -> 
                codeNameCache.put("PRG_STAT_CD_" + code.getCode(), code.getName()));
            
            // 신청 상태 코드
            List<CommonCodeDtoForCNSL> aplyStatCodes = 
                commonCodeService.getCodes("APLY_STAT_CD", null);
            aplyStatCodes.forEach(code -> 
                codeNameCache.put("APLY_STAT_CD_" + code.getCode(), code.getName()));
            
            // 신청 구분 코드
            List<CommonCodeDtoForCNSL> aplySelCodes = 
                commonCodeService.getCodes("APLY_SEL_CD", null);
            aplySelCodes.forEach(code -> 
                codeNameCache.put("APLY_SEL_CD_" + code.getCode(), code.getName()));
                
        } catch (Exception e) {
            System.err.println("공통코드 캐시 초기화 실패: " + e.getMessage());
        }
    }
    
    /**
     * 프로그램 상태 코드명 조회
     */
    public String getProgramStatusName(String statusCode) {
        if (statusCode == null) return "알 수 없음";
        return codeNameCache.getOrDefault("PRG_STAT_CD_" + statusCode, "알 수 없음");
    }
    
    /**
     * 신청 상태 코드명 조회
     */
    public String getApplicationStatusName(String statusCode) {
        if (statusCode == null) return "알 수 없음";
        return codeNameCache.getOrDefault("APLY_STAT_CD_" + statusCode, "알 수 없음");
    }
    
    /**
     * 신청 구분 코드명 조회
     */
    public String getApplicationTypeName(String typeCode) {
        if (typeCode == null) return "일반신청";
        return codeNameCache.getOrDefault("APLY_SEL_CD_" + typeCode, "일반신청");
    }
    
    /**
     * 프로그램 상태 코드 목록 조회
     */
    public Map<String, String> getProgramStatusCodes() {
        return codeNameCache.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith("PRG_STAT_CD_"))
            .collect(Collectors.toMap(
                entry -> entry.getKey().replace("PRG_STAT_CD_", ""),
                Map.Entry::getValue
            ));
    }
    
    /**
     * 캐시 갱신 (관리자가 공통코드 변경시 호출)
     */
    public void refreshCache() {
        codeNameCache.clear();
        initializeCache();
    }
}