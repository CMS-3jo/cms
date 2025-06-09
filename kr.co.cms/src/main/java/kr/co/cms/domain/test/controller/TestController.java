package kr.co.cms.domain.test.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.test.entity.Test;
import kr.co.cms.domain.test.service.TestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

@RestController("/api/test") 
public class TestController {
	
	/*
	private final TestService testService;
	
	@Autowired
    public TestController(TestService testService) {
        this.testService = testService;
    }
	
	@GetMapping("/test")
	public ResponseEntity<List<Test>> getAllTests() {
		List<Test> tests = testService.getAllTests();
		System.out.println("test");
		return new ResponseEntity<>(tests, HttpStatus.OK);
	}
	 */
	
	@GetMapping
	public String test() {
		System.out.println("test");
		return null;
	}


}
