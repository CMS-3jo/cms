package kr.co.cms.domain.cca.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
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

    @Transactional
    public void registerSurvey(CoreCptSurveyDto dto) {
        // 1) CORE_CPT_INFO 저장
        String cciId = UUID.randomUUID().toString()
                           .replace("-", "")
                           .substring(0, 20);

        CoreCptInfo info = CoreCptInfo.builder()
                .cciId(cciId)
                .cciNm(dto.getTitle())
                .categoryCd(dto.getCcaId())
                .regUserId(dto.getRegUserId())
                .regDt(LocalDateTime.now())
                .visibleYn("Y")
                .build();
        infoRepo.save(info);

        // 2) CORE_CPT_QST 저장 (foreign key: coreCptInfo)
        for (CoreCptSurveyDto.QuestionDto q : dto.getQuestions()) {
            CoreCptQst question = CoreCptQst.builder()
                    .qstId(UUID.randomUUID().toString()
                                 .replace("-", "")
                                 .substring(0, 20))
                    // <-- 여기!
                    .coreCptInfo(info)
                    .qstCont(q.getContent())
                    .qstOrd(q.getOrder())
                    .regUserId(dto.getRegUserId())
                    .regDt(LocalDateTime.now())
                    .build();
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