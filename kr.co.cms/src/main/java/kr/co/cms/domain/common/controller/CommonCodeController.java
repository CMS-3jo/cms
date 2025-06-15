package kr.co.cms.domain.common.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cnsl.dto.CommonCodeDtoForCNSL;
import kr.co.cms.domain.common.service.CommonCodeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/common")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    @GetMapping("/codes")
    public ResponseEntity<List<CommonCodeDtoForCNSL>> getCodes(
            @RequestParam("group") String groupCode,
            @RequestParam(value = "parent", required = false) String parent
    ) {
        return ResponseEntity.ok(commonCodeService.getCodes(groupCode, parent));
    }
}
