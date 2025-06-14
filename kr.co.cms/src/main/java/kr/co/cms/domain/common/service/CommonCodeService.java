package kr.co.cms.domain.common.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL;
import kr.co.cms.domain.common.entity.CommonCode;
import kr.co.cms.domain.common.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommonCodeService {

    private final CommonCodeRepository codeRepository;
    // 상담 신청 코드 받아오기
    public List<CommonCodeDtoForCNSL> getCodes(String groupCode, String parentDesc) {
        List<CommonCode> codes;

        if (parentDesc != null) {
            codes = codeRepository.findByGroupCodeAndDescription(groupCode, parentDesc);
        } else {
            codes = codeRepository.findByGroupCode(groupCode);
        }

        return codes.stream()
                .map(c -> new CommonCodeDtoForCNSL(c.getCode(), c.getName(), c.getDescription()))
                .toList();
    }
}
