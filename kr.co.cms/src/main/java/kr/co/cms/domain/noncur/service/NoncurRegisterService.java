package kr.co.cms.domain.noncur.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.cca.dto.CoreCptInfoDto;
import kr.co.cms.domain.cca.service.CoreCptInfoService;
import kr.co.cms.domain.mileage.repository.ProgramMileageRepository;
import kr.co.cms.domain.mileage.service.MileageService;
import kr.co.cms.domain.noncur.dto.NoncurRegisterDTO;
import kr.co.cms.domain.noncur.entity.NoncurProgram;
import kr.co.cms.domain.noncur.entity.NoncurMap;
import kr.co.cms.domain.noncur.repository.NoncurRepository;
import kr.co.cms.global.file.service.FileService;
import kr.co.cms.global.util.IdGenerator;
import kr.co.cms.domain.noncur.repository.NoncurMapRepository;

@Service
@Transactional(readOnly = true)
public class NoncurRegisterService {
    
    private final NoncurRepository noncurRepository;
    private final NoncurMapRepository noncurMapRepository;
    private final CoreCptInfoService coreCptInfoService;
    private final MileageService mileageService; 
    private final FileService fileService; 
    private final ProgramMileageRepository programMileageRepository;

    public NoncurRegisterService(NoncurRepository noncurRepository, 
            NoncurMapRepository noncurMapRepository,
            CoreCptInfoService coreCptInfoService,
            MileageService mileageService,
            FileService fileService,
            ProgramMileageRepository programMileageRepository) { 
			this.noncurRepository = noncurRepository;
			this.noncurMapRepository = noncurMapRepository;
			this.coreCptInfoService = coreCptInfoService; 
			this.mileageService = mileageService;
			this.fileService = fileService;
			this.programMileageRepository = programMileageRepository;
}
    
    
    
    /**
     * 핵심역량 매핑 저장
     */
    private void saveCompetencyMappings(String prgId, List<String> selectedCompetencies) {
        if (selectedCompetencies == null || selectedCompetencies.isEmpty()) {
            return;
        }
        
        try {
            // 기존 서비스에서 모든 핵심역량 조회
            List<CoreCptInfoDto> allCompetencies = coreCptInfoService.getAll();
            Set<String> validCciIds = allCompetencies.stream()
                .map(CoreCptInfoDto::getCciId)
                .collect(Collectors.toSet());
            
            for (String cciId : selectedCompetencies) {
                if (validCciIds.contains(cciId)) {
                    NoncurMap mapping = new NoncurMap(prgId, cciId);
                    noncurMapRepository.save(mapping);
                }
            }
        } catch (Exception e) {
            System.err.println("핵심역량 매핑 저장 중 오류: " + e.getMessage());
            throw new RuntimeException("핵심역량 매핑 저장에 실패했습니다.");
        }
    }
    
    
    /**
     * 비교과 프로그램 등록
     */
    @Transactional
    public String registerProgram(NoncurRegisterDTO registerDTO) {
        // 1. 프로그램 ID 생성
        String prgId = IdGenerator.generate("PRG", noncurRepository);
        registerDTO.setPrgId(prgId);
        
        // 2. 프로그램 기본 정보 저장
        NoncurProgram program = convertToEntity(registerDTO);
        noncurRepository.save(program);
        
        // 3. 핵심역량 매핑 저장
        saveCompetencyMappings(prgId, registerDTO.getSelectedCompetencies());
        
        //마일리지 저장
        if (registerDTO.getMlgScore() != null && registerDTO.getMlgScore().compareTo(BigDecimal.ZERO) >= 0) {
            mileageService.setProgramMileage(
                prgId, 
                registerDTO.getMlgScore(), 
                registerDTO.getRegUserId()
            );
        }
        
        return prgId;
        
    }
    
    
    /**
     * DTO를 Entity로 변환 (수정됨)
     */
    private NoncurProgram convertToEntity(NoncurRegisterDTO dto) {
        NoncurProgram program = new NoncurProgram();
        
        // 기본 정보
        program.setPrgId(dto.getPrgId());
        program.setPrgNm(dto.getPrgNm());
        program.setPrgDesc(dto.getPrgDesc());
        program.setPrgStDt(dto.getPrgStDt());
        program.setPrgEndDt(dto.getPrgEndDt());
        program.setPrgDeptCd(dto.getPrgDeptCd());
        program.setMaxCnt(dto.getMaxCnt());
        program.setPrgStatCd(dto.getPrgStatCd());
        program.setRegUserId(dto.getRegUserId());
        
        // 추가 정보 매핑
        program.setPrgLocation(dto.getLocation());
        program.setPrgContactEmail(dto.getContactEmail());
        program.setPrgContactPhone(dto.getContactPhone());
        program.setPrgTargetInfo(dto.getTargetInfo());
        program.setPrgDeptInfo(dto.getDepartmentInfo());
        program.setPrgGradeInfo(dto.getGradeInfo());
        program.setPrgSchedule(dto.getProgramSchedule());
        
        return program;
    }
    

    
    
    /**
     * 프로그램 수정
     */
    @Transactional
    public void updateProgram(String prgId, NoncurRegisterDTO updateDTO) {
        NoncurProgram program = noncurRepository.findById(prgId)
            .orElseThrow(() -> new IllegalArgumentException("프로그램을 찾을 수 없습니다."));
        
        // 기본 정보 업데이트
        program.setPrgNm(updateDTO.getPrgNm());
        program.setPrgDesc(updateDTO.getPrgDesc());
        program.setPrgStDt(updateDTO.getPrgStDt());
        program.setPrgEndDt(updateDTO.getPrgEndDt());
        program.setPrgDeptCd(updateDTO.getPrgDeptCd());
        program.setMaxCnt(updateDTO.getMaxCnt());
        program.setPrgStatCd(updateDTO.getPrgStatCd());
        program.setUpdUserId(updateDTO.getRegUserId());
        
        // 추가 정보 업데이트
        program.setPrgLocation(updateDTO.getLocation());
        program.setPrgContactEmail(updateDTO.getContactEmail());
        program.setPrgContactPhone(updateDTO.getContactPhone());
        program.setPrgTargetInfo(updateDTO.getTargetInfo());
        program.setPrgDeptInfo(updateDTO.getDepartmentInfo());
        program.setPrgGradeInfo(updateDTO.getGradeInfo());
        program.setPrgSchedule(updateDTO.getProgramSchedule());
        
        noncurRepository.save(program);
        
        // 핵심역량 매핑 재설정
        noncurMapRepository.deleteByPrgId(prgId);
        if (updateDTO.getSelectedCompetencies() != null && !updateDTO.getSelectedCompetencies().isEmpty()) {
            saveCompetencyMappings(prgId, updateDTO.getSelectedCompetencies());
        }
    }
    
    /**
     * 프로그램 삭제
     */
    @Transactional
    public void deleteProgram(String prgId) {
        if (!noncurRepository.existsById(prgId)) {
            throw new IllegalArgumentException("프로그램을 찾을 수 없습니다.");
        }
        
        try {
            // 1. 연관 파일들 삭제 (썸네일, 첨부파일 등)
            fileService.deleteFilesByRef("NONCUR", prgId, "SYSTEM");
            System.out.println("프로그램 연관 파일 삭제 완료: " + prgId);
            
            // 2. 프로그램에 설정된 마일리지 정보 삭제
            try {
                programMileageRepository.deleteByPrgId(prgId);
                System.out.println("프로그램 마일리지 삭제 완료: " + prgId);
            } catch (Exception e) {
                System.out.println("마일리지 삭제 중 오류 (계속 진행): " + e.getMessage());
            }
            
            // 3. 핵심역량 매핑 삭제 (FK 제약조건)
            noncurMapRepository.deleteByPrgId(prgId);
            System.out.println("핵심역량 매핑 삭제 완료: " + prgId);
            
            // 4. 프로그램 삭제
            noncurRepository.deleteById(prgId);
            System.out.println("프로그램 삭제 완료: " + prgId);
            
        } catch (Exception e) {
            System.err.println("프로그램 삭제 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("프로그램 삭제에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 프로그램 정보 조회 (수정용)
     */
    public NoncurRegisterDTO getProgramForEdit(String prgId) {
        NoncurProgram program = noncurRepository.findById(prgId)
            .orElseThrow(() -> new IllegalArgumentException("프로그램을 찾을 수 없습니다."));
        
        // 핵심역량 매핑 조회
        List<String> competencyIds = noncurMapRepository.findCompetencyIdsByProgramId(prgId);
        
        // Entity를 DTO로 변환
        NoncurRegisterDTO dto = new NoncurRegisterDTO();
        dto.setPrgId(program.getPrgId());
        dto.setPrgNm(program.getPrgNm());
        dto.setPrgDesc(program.getPrgDesc());
        dto.setPrgStDt(program.getPrgStDt());
        dto.setPrgEndDt(program.getPrgEndDt());
        dto.setPrgDeptCd(program.getPrgDeptCd());
        dto.setMaxCnt(program.getMaxCnt());
        dto.setPrgStatCd(program.getPrgStatCd());
        
        // 추가 정보
        dto.setLocation(program.getPrgLocation());
        dto.setContactEmail(program.getPrgContactEmail());
        dto.setContactPhone(program.getPrgContactPhone());
        dto.setTargetInfo(program.getPrgTargetInfo());
        dto.setDepartmentInfo(program.getPrgDeptInfo());
        dto.setGradeInfo(program.getPrgGradeInfo());
        dto.setProgramSchedule(program.getPrgSchedule());
        
        // 선택된 핵심역량
        dto.setSelectedCompetencies(competencyIds);
        
        return dto;
    }
}