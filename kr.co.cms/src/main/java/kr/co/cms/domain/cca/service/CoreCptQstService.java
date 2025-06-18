package kr.co.cms.domain.cca.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cca.dto.CoreCptQuestionDto;
import kr.co.cms.domain.cca.repository.CoreCptQstRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CoreCptQstService {

    private final CoreCptQstRepository qstRepo;

    /** 특정 설문(cciId)의 문항 리스트를 qstOrd 오름차순으로 반환 */
    public List<CoreCptQuestionDto> getQuestionsByCciId(String cciId) {
        return qstRepo
            .findByCoreCptInfo_CciIdOrderByQstOrdAsc(cciId)
            .stream()
            .map(entity -> {
                CoreCptQuestionDto dto = new CoreCptQuestionDto();
                dto.setQstId(entity.getQstId());
                dto.setQstCont(entity.getQstCont());
                dto.setQstOrd(entity.getQstOrd());
                dto.setCompetency(entity.getCategoryCd());
                return dto;
            })
            .collect(Collectors.toList());
    }
}
