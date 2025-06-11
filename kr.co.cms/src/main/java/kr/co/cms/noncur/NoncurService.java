package kr.co.cms.noncur;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor //생성자 자동주입
public class NoncurService {
	
	private final NoncurRepository repo;
	
	Page<NoncurProgram> findBySearchCondition(NoncurSearchDTO searchDTO){
		
		//정렬
		Sort sort = Sort.by(Sort.Direction.fromString(searchDTO.getSortDir()), searchDTO.getSortBy());
		Pageable pageable = PageRequest.of(searchDTO.getPage(), searchDTO.getSize(), sort);
		
		//검색
		String keyword = searchDTO.getKeyword();
		 if (keyword != null && keyword.trim().isEmpty()) {
	            keyword = null;
	        }
		
		 //학과로 검색?
	     String deptCode = searchDTO.getSearchDeptCode();
	   if (deptCode != null && deptCode.trim().isEmpty()) {
	       deptCode = null;
	   }
	   
       NoncurEnum.Status status = null;
       if (searchDTO.getSearchStatus() != null && !searchDTO.getSearchStatus().trim().isEmpty()) {
           try {
               status = NoncurEnum.Status.valueOf(searchDTO.getSearchStatus());
           } catch (IllegalArgumentException e) {
               // 잘못된 상태값은 무시
           }
       }
		return repo.findBySearchConditions(keyword, deptCode, status, pageable);
	}

	

}
