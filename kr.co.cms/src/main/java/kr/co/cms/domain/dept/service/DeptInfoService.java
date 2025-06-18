package kr.co.cms.domain.dept.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import kr.co.cms.domain.dept.dto.DeptInfoDto;
import kr.co.cms.domain.dept.repository.DeptInfoRepository;

@Service
public class DeptInfoService {

    private final DeptInfoRepository repo;

    public DeptInfoService(DeptInfoRepository repo) {
        this.repo = repo;
    }

    /** 전체 조회 */
    public List<DeptInfoDto> getAll() {
        return repo.findAll()
                   .stream()
                   .map(DeptInfoDto::fromEntity)
                   .collect(Collectors.toList());
    }

    /**
     * 접두사(type + "_") 로 조회
     * @param type 'S','C','P','A'
     */
    public List<DeptInfoDto> getByType(char type) {
        String prefix = type + "_";
        return repo.findByDeptCdStartingWith(prefix)
                   .stream()
                   .map(DeptInfoDto::fromEntity)
                   .collect(Collectors.toList());
    }
}