package kr.co.cms.domain.test.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.test.entity.Test;
import kr.co.cms.domain.test.service.TestService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
	
	private final TestService testService;
	
	@GetMapping
	public ResponseEntity<List<Test>> getAllTests() {
		List<Test> tests = testService.getAllTests();
		System.out.println("test");
		return new ResponseEntity<>(tests, HttpStatus.OK);
	}

}
