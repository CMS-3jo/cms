package kr.co.cms.domain.cca.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /**
     * 1) 새로운 설문 등록 (CORE_CPT_INFO + CORE_CPT_QST)
     */
    @Transactional
    public void registerSurvey(CoreCptSurveyDto dto) {
        // 1) CoreCptInfo 엔티티 생성
        CoreCptInfo info = CoreCptInfo.builder()
            .cciId(UUID.randomUUID().toString())
            .cciNm(dto.getTitle())        // DTO 의 title
            .categoryCd(dto.getCcaId())   // DTO 의 ccaId
            .cciDesc(null)                // DTO 에 description 이 없으므로 필요하다면 DTO 에 추가하거나 null 처리
            .regUserId(dto.getRegUserId())
            .regDt(LocalDateTime.now())
            .visibleYn("Y")
            .build();

        // 2) 저장
        infoRepo.save(info);

        // 3) 문항 매핑 & 저장
        List<CoreCptQst> questions = dto.getQuestions().stream()
        		 .map(q -> CoreCptQst.builder()
                         .qstId(UUID.randomUUID().toString().replace("-", "").substring(0, 20))
                         .coreCptInfo(info)
                         .qstCont(q.getContent())
                         .categoryCd(q.getCompetency())
                         .qstOrd(q.getOrder())
                         .regUserId(dto.getRegUserId())
                         .regDt(LocalDateTime.now())
                         .build()
                     ).collect(Collectors.toList());
        	// 여기서 CoreCptQstRepository를 사용하세요!
        	qstRepo.saveAll(questions);
    }

    public List<CoreCptInfoDto> getAll() {
        return infoRepo.findAll().stream()
            .map(entity -> {
                CoreCptInfoDto dto = new CoreCptInfoDto();
                dto.setCciId(entity.getCciId());
                dto.setCciNm(entity.getCciNm());
                dto.setCciDesc(entity.getCciDesc());
                dto.setCategoryCd(entity.getCategoryCd());
                dto.setRegDt(entity.getRegDt());    // ← 날짜 매핑 추가!
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * 3) 특정 설문 상세(제목, 카테고리, 문항리스트) 조회
     */
    @Transactional(readOnly = true)
    public CoreCptSurveyDto getSurveyDetail(String cciId) {
        CoreCptInfo info = infoRepo.findById(cciId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문 ID: " + cciId));

        CoreCptSurveyDto dto = new CoreCptSurveyDto();
        dto.setTitle(info.getCciNm());
        dto.setCcaId(info.getCategoryCd());
        dto.setRegUserId(info.getRegUserId());

        List<CoreCptQst> qsts = info.getQuestions().stream()
            .sorted(Comparator.comparing(CoreCptQst::getQstOrd))
            .collect(Collectors.toList());

        List<CoreCptSurveyDto.QuestionDto> questions = qsts.stream()
            .map(q -> {
                CoreCptSurveyDto.QuestionDto qdto = new CoreCptSurveyDto.QuestionDto();
                qdto.setOrder(q.getQstOrd());
                qdto.setContent(q.getQstCont());
                qdto.setCompetency(q.getCategoryCd());
                return qdto;
            })
            .collect(Collectors.toList());

        dto.setQuestions(questions);
        return dto;
    }

    /**
     * 4) 설문 수정 (제목/카테고리/문항 전체 교체)
     */
    @Transactional
    public void updateSurvey(String cciId, CoreCptSurveyDto dto) {
        CoreCptInfo info = infoRepo.findById(cciId)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 설문 ID: " + cciId));

        // 1) 설문 정보 업데이트
        info.setCciNm(dto.getTitle());
        info.setCategoryCd(dto.getCcaId());
        info.setRegUserId(dto.getRegUserId());
        info.setRegDt(LocalDateTime.now());

        // 2) 기존 문항 컬렉션 유지한 채 내용 교체 (orphanRemoval=true)
        info.getQuestions().clear();

        List<CoreCptQst> newQuestions = dto.getQuestions().stream()
            .map(q -> CoreCptQst.builder()
                    .qstId(UUID.randomUUID().toString().replace("-", "").substring(0, 20))
                    .coreCptInfo(info)
                    .qstCont(q.getContent())
                    .categoryCd(q.getCompetency())
                    .qstOrd(q.getOrder())
                    .regUserId(dto.getRegUserId())
                    .regDt(LocalDateTime.now())
                    .build()
            ).collect(Collectors.toList());
        info.getQuestions().addAll(newQuestions);

        infoRepo.save(info);
    }

    /**
     * 5) 설문 삭제 (CORE_CPT_INFO + CORE_CPT_QST 모두 cascade 삭제)
     */
    @Transactional
    public void deleteSurvey(String cciId) {
        if (!infoRepo.existsById(cciId)) {
            throw new IllegalArgumentException("삭제할 설문이 존재하지 않습니다. ID: " + cciId);
        }
        infoRepo.deleteById(cciId);
    }
}
