package kr.co.cms.domain.cca.service;

import kr.co.cms.domain.cca.dto.CcaCompScoreDto;
import kr.co.cms.domain.cca.entity.CoreCptEval;
import kr.co.cms.domain.cca.repository.CoreCptEvalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.cms.domain.cca.dto.CcaScoreSummaryDto;
import kr.co.cms.domain.mypage.entity.StdInfo;
import kr.co.cms.domain.mypage.repository.StdInfoRepository;
import lombok.RequiredArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CcaScoreService {

    private final CoreCptEvalRepository evalRepo;
    private final StdInfoRepository stdInfoRepository;

    public List<CcaCompScoreDto> calculateScores(String stdNo, String cciId) {
        // 1) 답안 전체 조회 (메서드 이름 변경)
        List<CoreCptEval> evals = evalRepo
            .findByStdNoAndQuestion_CoreCptInfo_CciId(stdNo, cciId);

        // 2) 역량별 그룹핑: CoreCptEval::getQuestion 으로 접근
        Map<String, List<CoreCptEval>> byComp = evals.stream()
            .collect(Collectors.groupingBy(e ->
                e.getQuestion()
                 .getCategoryCd()
            ));

        // 3) 점수 계산
        List<CcaCompScoreDto> result = new ArrayList<>();
        for (Map.Entry<String, List<CoreCptEval>> entry : byComp.entrySet()) {
            String comp = entry.getKey();
            List<CoreCptEval> list = entry.getValue();

            BigDecimal sum = list.stream()
                .map(CoreCptEval::getAnsScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal maxSum = BigDecimal.valueOf(list.size() * 5.0);
            double pct = maxSum.compareTo(BigDecimal.ZERO) > 0
                ? sum.divide(maxSum, 4, RoundingMode.HALF_UP)
                     .multiply(BigDecimal.valueOf(100))
                     .setScale(2, RoundingMode.HALF_UP)
                     .doubleValue()
                : 0.0;

            result.add(new CcaCompScoreDto(comp, pct));
        }
        return result;
    }
    public CcaScoreSummaryDto calculateScoreSummary(String stdNo, String cciId) {
        List<CcaCompScoreDto> myScores = calculateScores(stdNo, cciId);

        StdInfo std = stdInfoRepository.findByStdNo(stdNo)
                .orElse(null);
        String deptCd = std != null ? std.getDeptCd() : null;

        List<CcaCompScoreDto> deptAvg = new ArrayList<>();
        if (deptCd != null) {
            List<Object[]> rows = evalRepo.findDeptAverageScores(cciId, deptCd);
            for (Object[] r : rows) {
                deptAvg.add(new CcaCompScoreDto(
                        Objects.toString(r[0]),
                        r[1] != null ? ((Number) r[1]).doubleValue() : 0.0));
            }
        }

        List<CcaCompScoreDto> overallAvg = new ArrayList<>();
        List<Object[]> rows2 = evalRepo.findOverallAverageScores(cciId);
        for (Object[] r : rows2) {
            overallAvg.add(new CcaCompScoreDto(
                    Objects.toString(r[0]),
                    r[1] != null ? ((Number) r[1]).doubleValue() : 0.0));
        }
        java.time.LocalDateTime latestDate = evalRepo.findLatestAnswerDate(stdNo, cciId);
        // strengths and weaknesses from myScores
        List<CcaCompScoreDto> sorted = new ArrayList<>(myScores);
        sorted.sort(Comparator.comparingDouble(CcaCompScoreDto::getScore));

        List<String> weaknesses = sorted.stream()
                .limit(2)
                .map(CcaCompScoreDto::getCompetency)
                .toList();
        List<String> strengths = sorted.stream()
                .sorted(Comparator.comparingDouble(CcaCompScoreDto::getScore).reversed())
                .limit(2)
                .map(CcaCompScoreDto::getCompetency)
                .toList();

        Map<String, String> recMap = Map.of(
                "의사소통", "커뮤니케이션 워크숍",
                "문제해결", "문제해결 워크숍",
                "자기관리", "자기관리 향상 프로그램",
                "대인관계", "대인관계 향상 트레이닝",
                "글로벌역량", "글로벌 역량 강화 프로그램",
                "직업윤리 및 책임역량", "직업윤리 세미나"
        );

        List<String> recs = weaknesses.stream()
                .map(w -> recMap.getOrDefault(w, w + " 프로그램"))
                .toList();

        CcaScoreSummaryDto dto = new CcaScoreSummaryDto();
        dto.setStudentScores(myScores);
        dto.setDeptAvgScores(deptAvg);
        dto.setOverallAvgScores(overallAvg);
        dto.setStrengths(strengths);
        dto.setWeaknesses(weaknesses);
        dto.setRecommendations(recs);
        dto.setLatestAnswerDate(latestDate);
        return dto;
    }
}
