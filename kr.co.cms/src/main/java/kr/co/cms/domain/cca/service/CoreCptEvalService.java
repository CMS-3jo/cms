package kr.co.cms.domain.cca.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cca.dto.CoreCptEvalRequestDto;
import kr.co.cms.domain.cca.entity.CoreCptEval;
import kr.co.cms.domain.cca.repository.CoreCptEvalRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoreCptEvalService {

    private final CoreCptEvalRepository evalRepo;

    public void submitAnswers(CoreCptEvalRequestDto dto) {
        String stdNo = dto.getStdNo();   // dto.getStdNo() → "20240001"
        System.out.println("▶ stdNo   = [" + stdNo + "]");

        for (CoreCptEvalRequestDto.AnswerDto answer : dto.getAnswers()) {
            CoreCptEval eval = new CoreCptEval();
            eval.setEvalId(UUID.randomUUID().toString().substring(0,20));
            // auth.getName() 대신 dto.getStdNo() 사용!
            eval.setStdNo(stdNo);
            eval.setQstId(answer.getQstId());
            eval.setAnsScore(BigDecimal.valueOf(answer.getScore()));
            eval.setAnsDt(LocalDateTime.now());
            evalRepo.save(eval);
        }
    }

}
