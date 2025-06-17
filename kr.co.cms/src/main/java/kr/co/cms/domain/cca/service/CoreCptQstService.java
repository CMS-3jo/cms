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

    public List<CoreCptQuestionDto> getQuestionsByCciId(String cciId) {
        return qstRepo.findByCciIdOrderByQstOrdAsc(cciId)
                .stream()
                .map(entity -> {
                    CoreCptQuestionDto dto = new CoreCptQuestionDto();
                    dto.setQstId(entity.getQstId());
                    dto.setQstCont(entity.getQstCont());
                    dto.setQstOrd(entity.getQstOrd());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
