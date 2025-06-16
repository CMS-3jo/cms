package kr.co.cms.domain.noncur.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kr.co.cms.domain.noncur.dto.NoncurSearchDTO;
import kr.co.cms.domain.noncur.entity.NoncurMap;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.repository.NoncurMapRepository;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class NoncurService {
    
    private final NoncurRepository repo;
    private final NoncurMapRepository mapRepo;
    
    public Page<NoncurProgram> findBySearchCondition(NoncurSearchDTO searchDTO){
        
        // 정렬
        Sort sort = Sort.by(Sort.Direction.fromString(searchDTO.getSortDir()), searchDTO.getSortBy());
        Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);
        
        // 검색 키워드 처리
        String keyword = searchDTO.getKeyword();
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }
        
        // 부서코드 처리
        String deptCode = searchDTO.getSearchDeptCode();
        if (deptCode != null && deptCode.trim().isEmpty()) {
            deptCode = null;
        }
        
        // 상태코드 처리 (01, 02, 03, 04, 05)
        String statusCode = searchDTO.getSearchStatusCode();
        if (statusCode != null && statusCode.trim().isEmpty()) {
            statusCode = null;
        }
        
        return repo.findBySearchConditions(keyword, deptCode, statusCode, pageable);
    }
    
    // 페이지네이션 정보와 함께 프로그램 목록 반환 (Entity 직접 사용 + 부서명 추가)
    public Map<String, Object> getNoncurProgramsWithPagination(NoncurSearchDTO searchDTO) {
        Page<NoncurProgram> noncurPage = findBySearchCondition(searchDTO);
        
        // Entity에 부서명 설정
        noncurPage.getContent().forEach(program -> {
            program.setDeptName(getDeptName(program.getPrgDeptCd()));
        });
        
        // 페이지네이션 정보 설정
        searchDTO.setTotalElements(noncurPage.getTotalElements());
        searchDTO.setTotalPages(noncurPage.getTotalPages());
        searchDTO.setHasNext(noncurPage.hasNext());
        searchDTO.setHasPrevious(noncurPage.hasPrevious());
        searchDTO.setFirst(noncurPage.isFirst());
        searchDTO.setLast(noncurPage.isLast());
        
        // 응답 구성 - Entity 그대로 사용 (deptName 포함)
        Map<String, Object> response = new HashMap<>();
        response.put("content", noncurPage.getContent());
        response.put("pagination", searchDTO);
        
        return response;
    }
    
    // 부서명 조회
    private String getDeptName(String deptCode) {
        if (deptCode == null || deptCode.trim().isEmpty()) {
            return "알 수 없음";
        }
        
        try {
            String deptName = repo.findDeptNameByCode(deptCode);
            return deptName != null ? deptName : deptCode;
        } catch (Exception e) {
            return deptCode;
        }
    }
    
    // 프로그램의 핵심역량 ID 목록 조회
    public List<String> getProgramCompetencyIds(String prgId) {
        return mapRepo.findCompetencyIdsByProgramId(prgId);
    }
    
    // 핵심역량을 가진 프로그램 ID 목록 조회
    public List<String> getCompetencyProgramIds(String cciId) {
        return mapRepo.findProgramIdsByCompetencyId(cciId);
    }
    
    // 프로그램에 핵심역량 추가
    @Transactional
    public void addCompetencyToProgram(String prgId, String cciId) {
        if (!mapRepo.existsByPrgIdAndCciId(prgId, cciId)) {
            mapRepo.save(new NoncurMap(prgId, cciId));
        }
    }
    
    // 프로그램에서 핵심역량 제거
    @Transactional
    public void removeCompetencyFromProgram(String prgId, String cciId) {
        mapRepo.deleteByPrgIdAndCciId(prgId, cciId);
    }
    
    // 프로그램의 핵심역량 개수 조회
    public Long getProgramCompetencyCount(String prgId) {
        return mapRepo.countByProgramId(prgId);
    }
}