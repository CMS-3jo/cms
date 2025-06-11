package kr.co.cms.noncur;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;


@RestController
@RequestMapping("/api/noncur")
public class NoncurController {
	private final NoncurService service;
	
	public NoncurController(NoncurService service) {
		this.service = service;
	}
	
	@GetMapping
	public ResponseEntity<Page<NoncurProgram>> noncurList(
			@ModelAttribute NoncurSearchDTO searchDTO){
		Page<NoncurProgram> noncurList = service.findBySearchCondition(searchDTO);
		return ResponseEntity.ok(noncurList);
	}
	

}
