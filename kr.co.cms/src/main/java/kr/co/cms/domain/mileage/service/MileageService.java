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
        System.out.println("=== 마일리지 부여 시작 ===");
        System.out.println("프로그램 ID: " + requestDTO.getPrgId());
        System.out.println("학번: " + requestDTO.getStdNo());
        System.out.println("등록자 ID: " + requestDTO.getRegUserId());
        
        try {
            // 1. 중복 부여 방지 체크
            boolean alreadyExists = historyRepository.existsByPrgIdAndStdNo(requestDTO.getPrgId(), requestDTO.getStdNo());
            System.out.println("중복 체크 결과: " + alreadyExists);
            
            if (alreadyExists) {
                System.err.println("중복 마일리지 부여 감지!");
                throw new IllegalStateException("이미 마일리지가 부여된 프로그램입니다.");
            }
            
            // 2. 프로그램 마일리지 조회
            System.out.println("프로그램 마일리지 조회 중...");
            ProgramMileage programMileage = programMileageRepository.findByProgramId(requestDTO.getPrgId());
            
            if (programMileage == null) {
                System.err.println("프로그램 마일리지 설정 없음!");
                throw new IllegalArgumentException("해당 프로그램에 마일리지가 설정되지 않았습니다.");
            }
            
            BigDecimal awardMileage = programMileage.getMlgScore();
            System.out.println("부여할 마일리지: " + awardMileage);
            
            // 3. STD_MILEAGE_TOTAL 확인/생성
            System.out.println("학생 마일리지 총합 테이블 확인 중...");
            ensureStudentMileageTotalExists(requestDTO.getStdNo());
            
            // 4. 마일리지 히스토리 생성
            System.out.println("마일리지 히스토리 생성 중...");
            String mlgId = generateMileageId();
            System.out.println("생성된 마일리지 ID: " + mlgId);
            
            StudentMileageHistory history = new StudentMileageHistory(
                mlgId,
                requestDTO.getPrgId(),
                requestDTO.getStdNo(),
                requestDTO.getCmpId(),
                awardMileage,
                MileageConstants.MileageType.ADD
            );
            
            historyRepository.save(history);
            System.out.println("마일리지 히스토리 저장 완료");
            
            // 5. 총 마일리지 업데이트
            System.out.println("총 마일리지 업데이트 중...");
            updateStudentTotalMileage(requestDTO.getStdNo(), awardMileage, true);
            System.out.println("총 마일리지 업데이트 완료");
            
            System.out.println("=== 마일리지 부여 성공 ===");
            
        } catch (Exception e) {
            System.err.println("=== 마일리지 부여 실패 ===");
            System.err.println("오류 타입: " + e.getClass().getSimpleName());
            System.err.println("오류 메시지: " + e.getMessage());
            e.printStackTrace();
            throw e; // 원래 예외 다시 던지기
        }
    }
    
    
    
    //STD_MILEAGE_TOTAL 존재 여부 확인 및 생성
    @Transactional
    public void ensureStudentMileageTotalExists(String stdNo) {
        StudentMileageTotal total = totalRepository.findByStudentNo(stdNo);
        
        if (total == null) {
            // 해당 학생의 총 마일리지 레코드가 없으면 생성
            total = new StudentMileageTotal(stdNo);
            totalRepository.save(total);
            
            System.out.println("새 학생 마일리지 총합 레코드 생성: " + stdNo);
        }
    }
    

    
     //학생 총 마일리지 업데이트
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
        List<Object[]> results = historyRepository.findRecentHistoryByStudentNo(stdNo, 10);
        
        List<MileageHistoryDTO> historyDTOs = results.stream()
            .map(result -> {
                StudentMileageHistory history = (StudentMileageHistory) result[0];
                String prgNm = (String) result[1];
                
                MileageHistoryDTO dto = convertToHistoryDTO(history);
                dto.setPrgNm(prgNm != null ? prgNm : "프로그램 정보 없음");
                return dto;
            })
            .collect(Collectors.toList());
        
        StudentMileageDTO dto = new StudentMileageDTO();
        dto.setStdNo(stdNo);
        dto.setTotalMileage(total != null ? total.getTotMlgScore() : BigDecimal.ZERO);
        dto.setLastUpdatedAt(total != null ? total.getLastUpdDt() : null);
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