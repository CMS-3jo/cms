package kr.co.cms.domain.test.service;

import kr.co.cms.domain.test.entity.Test; 
import kr.co.cms.domain.test.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TestService {

    private final TestRepository testRepository;

    @Autowired
    public TestService(TestRepository testRepository) {
        this.testRepository = testRepository;
    }

    @Transactional
    public Test saveTest(String name) { 
        Test test = new Test(name); 
        return testRepository.save(test);
    }

    public List<Test> getAllTests() { 
        return testRepository.findAll();
    }

}