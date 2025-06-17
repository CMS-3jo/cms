package kr.co.cms.domain.cca.service;

import kr.co.cms.domain.cca.dto.CcaCompScoreDto;
import kr.co.cms.domain.cca.entity.CoreCptEval;
import kr.co.cms.domain.cca.repository.CoreCptEvalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CcaScoreService {

    private final CoreCptEvalRepository evalRepo;

    public CcaScoreService(CoreCptEvalRepository evalRepo) {
        this.evalRepo = evalRepo;
    }

    public List<CcaCompScoreDto> calculateScores(String stdNo, String cciId) {
        // 1) 답안 전체 조회 (메서드 이름 변경)
        List<CoreCptEval> evals = evalRepo
            .findByStdNoAndQuestion_CoreCptInfo_CciId(stdNo, cciId);

        // 2) 역량별 그룹핑: CoreCptEval::getQuestion 으로 접근
        Map<String, List<CoreCptEval>> byComp = evals.stream()
            .collect(Collectors.groupingBy(e ->
                e.getQuestion()
                 .getCoreCptInfo()
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
}
