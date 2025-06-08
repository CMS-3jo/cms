package kr.co.cms.global;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class globalinit {
	
	@GetMapping("/test")
	public String test() {
		System.out.println("test");
		return null;
	}

}
