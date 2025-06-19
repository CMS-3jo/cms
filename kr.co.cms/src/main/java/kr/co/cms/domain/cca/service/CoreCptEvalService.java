package kr.co.cms.domain.cca.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cca.dto.CoreCptEvalRequestDto;
import kr.co.cms.domain.cca.entity.CoreCptEval;
import kr.co.cms.domain.cca.entity.CoreCptQst;
import kr.co.cms.domain.cca.repository.CoreCptEvalRepository;
import kr.co.cms.domain.mypage.entity.StdInfo;
import kr.co.cms.domain.mypage.repository.StdInfoRepository;
import lombok.RequiredArgsConstructor;
import kr.co.cms.domain.cca.repository.CoreCptQstRepository;
@Service
@RequiredArgsConstructor
public class CoreCptEvalService {

    private final CoreCptEvalRepository evalRepo;
    private final CoreCptQstRepository qstRepo;
    private final StdInfoRepository stdRepo;
    
    public void submitAnswers(CoreCptEvalRequestDto dto) {
        String stdNo = dto.getStdNo();   // dto.getStdNo() → "20240001"
        System.out.println("▶ stdNo   = [" + stdNo + "]");
        // 학생 정보가 존재하지 않으면 기본값으로 생성
        stdRepo.findById(stdNo).orElseGet(() ->
            stdRepo.save(StdInfo.builder()
                .stdNo(stdNo)
                .stdNm("Unknown")
                .deptCd("TEMP")
                .build())
        );

        
        for (CoreCptEvalRequestDto.AnswerDto answer : dto.getAnswers()) {
            CoreCptEval eval = new CoreCptEval();
            eval.setEvalId(UUID.randomUUID().toString().substring(0,20));
            // auth.getName() 대신 dto.getStdNo() 사용!
            eval.setStdNo(stdNo);
            // QST_ID 컬럼은 insertable=false 이므로 실제 엔티티 참조를 설정해야 한다.
            CoreCptQst question = qstRepo.findById(answer.getQstId())
                .orElseThrow(() -> new IllegalArgumentException(
                    "invalid question id: " + answer.getQstId()));
            eval.setQuestion(question);

            
            eval.setAnsScore(BigDecimal.valueOf(answer.getScore()));
            eval.setAnsDt(LocalDateTime.now());
            evalRepo.save(eval);
        }
    }

}
