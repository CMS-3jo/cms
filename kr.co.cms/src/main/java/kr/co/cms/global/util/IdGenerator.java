package kr.co.cms.global.util;

import java.time.LocalDateTime;

import kr.co.cms.global.repository.IdManagedRepository;

public class IdGenerator {

    /**
     범용 순차 ID 생성기
     @param code "PRG", "MLG" 등 ID 접두사 코드
     @param repository DB 조회를 수행할 IdManagedRepository 구현체
     @return 완성된 새 ID

	
	 1.repo에서 기존 id값 조회 메서드 Override 후
     @Override
     @Query("SELECT MAX(p.prgId) FROM NoncurProgram p WHERE p.prgId LIKE :prefix%")
     String findLatestIdByPrefix(@Param("prefix") String prefix);
    
    2. 서비스에서 id 생성
    String prgId = IdGenerator.generate("PRG", noncurRepository);
    registerDTO.setPrgId(prgId);
    
    
  
     **/
    public static String generate(String code, IdManagedRepository repository) {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String prefix = code + year;

        String lastId = repository.findLatestIdByPrefix(prefix);
        
        int nextSeq = 1;
        if (lastId != null) {
            String seqStr = lastId.substring(prefix.length());
            nextSeq = Integer.parseInt(seqStr) + 1;
        }

        return prefix + String.format("%04d", nextSeq);
    }
}
