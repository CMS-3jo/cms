package kr.co.cms.domain.cca.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cca.dto.CoreCptInfoDto;
import kr.co.cms.domain.cca.dto.CoreCptSurveyDto;
import kr.co.cms.domain.cca.entity.CoreCptInfo;
import kr.co.cms.domain.cca.entity.CoreCptQst;
import kr.co.cms.domain.cca.repository.CoreCptInfoRepository;
import kr.co.cms.domain.cca.repository.CoreCptQstRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoreCptInfoService {

    private final CoreCptInfoRepository infoRepo;
    private final CoreCptQstRepository qstRepo;

    public void registerSurvey(CoreCptSurveyDto dto) {
        // 핵심역량 설문 info 등록
        String cciId = UUID.randomUUID().toString().replace("-", "").substring(0, 20);

        CoreCptInfo info = new CoreCptInfo();
        info.setCciId(cciId);
        info.setCciNm(dto.getTitle());
        info.setCategoryCd(dto.getCcaId());
        info.setRegUserId(dto.getRegUserId());
        info.setRegDt(LocalDateTime.now());
        info.setVisibleYn("Y");

        infoRepo.save(info);

        // 문항 등록
        for (CoreCptSurveyDto.QuestionDto q : dto.getQuestions()) {
            CoreCptQst question = new CoreCptQst();
            question.setQstId(UUID.randomUUID().toString().replace("-", "").substring(0, 20));
            question.setCciId(cciId);
            question.setQstCont(q.getContent());
            question.setQstOrd(q.getOrder());
            question.setRegUserId(dto.getRegUserId());
            question.setRegDt(LocalDateTime.now());
            qstRepo.save(question);
        }
    }
    public List<CoreCptInfoDto> getAll() {
        return infoRepo.findAll().stream().map(entity -> {
            CoreCptInfoDto dto = new CoreCptInfoDto();
            dto.setCciId(entity.getCciId());
            dto.setCciNm(entity.getCciNm());
            dto.setCciDesc(entity.getCciDesc());
            dto.setCategoryCd(entity.getCategoryCd());
            return dto;
        }).collect(Collectors.toList());
    }
}