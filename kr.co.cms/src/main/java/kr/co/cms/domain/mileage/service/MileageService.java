package kr.co.cms.domain.mileage.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.cms.domain.mileage.constants.MileageConstants;
import kr.co.cms.domain.mileage.dto.MileageAwardRequestDTO;
import kr.co.cms.domain.mileage.dto.MileageHistoryDTO;
import kr.co.cms.domain.mileage.dto.ProgramMileageDTO;
import kr.co.cms.domain.mileage.dto.StudentMileageDTO;
import kr.co.cms.domain.mileage.entity.ProgramMileage;
import kr.co.cms.domain.mileage.entity.StudentMileageHistory;
import kr.co.cms.domain.mileage.entity.StudentMileageTotal;
import kr.co.cms.domain.mileage.repository.ProgramMileageRepository;
import kr.co.cms.domain.mileage.repository.StudentMileageHistoryRepository;
import kr.co.cms.domain.mileage.repository.StudentMileageTotalRepository;

@Service
@Transactional(readOnly = true)
public class MileageService {
    
    private final ProgramMileageRepository programMileageRepository;
    private final StudentMileageHistoryRepository historyRepository;
    private final StudentMileageTotalRepository totalRepository;
    
    public MileageService(ProgramMileageRepository programMileageRepository,
                         StudentMileageHistoryRepository historyRepository,
                         StudentMileageTotalRepository totalRepository) {
        this.programMileageRepository = programMileageRepository;
        this.historyRepository = historyRepository;
        this.totalRepository = totalRepository;
    }
    
    /**
     * 프로그램 마일리지 설정
     */
    @Transactional
    public void setProgramMileage(String prgId, BigDecimal mlgScore, String regUserId) {
        ProgramMileage programMileage = programMileageRepository.findByProgramId(prgId);
        
        if (programMileage == null) {
            // 신규 등록
            programMileage = new ProgramMileage(prgId, mlgScore, regUserId);
        } else {
            // 기존 수정
            programMileage.setMlgScore(mlgScore);
            programMileage.setUpdUserId(regUserId);
        }
        
        programMileageRepository.save(programMileage);
    }
    
    /**
     * 학생에게 마일리지 부여 (프로그램 이수완료 시)
     */
    @Transactional
    public void awardMileage(MileageAwardRequestDTO requestDTO) {
        // 중복 부여 방지
        if (historyRepository.existsByPrgIdAndStdNo(requestDTO.getPrgId(), requestDTO.getStdNo())) {
            throw new IllegalStateException("이미 마일리지가 부여된 프로그램입니다.");
        }
        
        // 프로그램 마일리지 조회
        ProgramMileage programMileage = programMileageRepository.findByProgramId(requestDTO.getPrgId());
        if (programMileage == null) {
            throw new IllegalArgumentException("해당 프로그램에 마일리지가 설정되지 않았습니다.");
        }
        
        BigDecimal awardMileage = programMileage.getMlgScore();
        
        // 마일리지 히스토리 생성
        String mlgId = generateMileageId();
        StudentMileageHistory history = new StudentMileageHistory(
            mlgId,
            requestDTO.getPrgId(),
            requestDTO.getStdNo(),
            requestDTO.getCmpId(),
            awardMileage,
            MileageConstants.MileageType.ADD
        );
        
        historyRepository.save(history);
        
        // 총 마일리지 업데이트
        updateStudentTotalMileage(requestDTO.getStdNo(), awardMileage, true);
    }
    
    /**
     * 학생 총 마일리지 업데이트
     */
    @Transactional
    public void updateStudentTotalMileage(String stdNo, BigDecimal amount, boolean isAdd) {
        StudentMileageTotal total = totalRepository.findByStudentNo(stdNo);
        
        if (total == null) {
            // 신규 학생
            total = new StudentMileageTotal(stdNo);
        }
        
        BigDecimal currentTotal = total.getTotMlgScore();
        BigDecimal newTotal = isAdd ? 
            currentTotal.add(amount) : 
            currentTotal.subtract(amount);
            
        // 마일리지가 음수가 되지 않도록 체크
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }
        
        total.setTotMlgScore(newTotal);
        totalRepository.save(total);
    }
    
    /**
     * 학생 마일리지 정보 조회
     */
    public StudentMileageDTO getStudentMileage(String stdNo) {
        StudentMileageTotal total = totalRepository.findByStudentNo(stdNo);
        List<StudentMileageHistory> recentHistory = 
            historyRepository.findRecentHistoryByStudentNo(stdNo, 10);
        
        StudentMileageDTO dto = new StudentMileageDTO();
        dto.setStdNo(stdNo);
        dto.setTotalMileage(total != null ? total.getTotMlgScore() : BigDecimal.ZERO);
        dto.setLastUpdatedAt(total != null ? total.getLastUpdDt() : null);
        
        List<MileageHistoryDTO> historyDTOs = recentHistory.stream()
            .map(this::convertToHistoryDTO)
            .collect(Collectors.toList());
        dto.setRecentHistory(historyDTOs);
        
        return dto;
    }
    
    /**
     * 프로그램 마일리지 조회
     */
    public ProgramMileageDTO getProgramMileage(String prgId) {
        ProgramMileage programMileage = programMileageRepository.findByProgramId(prgId);
        
        if (programMileage == null) {
            return null;
        }
        
        ProgramMileageDTO dto = new ProgramMileageDTO();
        dto.setPrgId(programMileage.getPrgId());
        dto.setMlgScore(programMileage.getMlgScore());
        dto.setRegUserId(programMileage.getRegUserId());
        dto.setRegDt(programMileage.getRegDt());
        
        return dto;
    }
    
    /**
     * 마일리지 ID 생성
     */
    private String generateMileageId() {
        return "MLG" + LocalDateTime.now().format(
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
        ) + String.format("%03d", (int)(Math.random() * 1000));
    }
    
    /**
     * History Entity to DTO 변환
     */
    private MileageHistoryDTO convertToHistoryDTO(StudentMileageHistory history) {
        MileageHistoryDTO dto = new MileageHistoryDTO();
        dto.setMlgId(history.getMlgId());
        dto.setPrgId(history.getPrgId());
        dto.setStdNo(history.getStdNo());
        dto.setCmpId(history.getCmpId());
        dto.setMlgScore(history.getMlgScore());
        dto.setMlgDt(history.getMlgDt());
        dto.setMlgAddCd(history.getMlgAddCd());
        dto.setMlgAddNm(MileageConstants.getTypeName(history.getMlgAddCd()));
        // 프로그램명은 별도 조회 필요 (조인 또는 서비스에서 처리)
        return dto;
    }
}