package kr.co.cms.domain.noncur.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import kr.co.cms.domain.noncur.dto.NoncurSearchDTO;
import kr.co.cms.domain.noncur.service.NoncurService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.Map;

@RestController
@RequestMapping("/api/noncur")
@CrossOrigin(origins = "*") // 개발용 CORS 설정
public class NoncurController {
    private final NoncurService service;
    
    public NoncurController(NoncurService service) {
        this.service = service;
    }
    
    @GetMapping
    @ResponseBody  
    public ResponseEntity<Map<String, Object>> noncurList(@ModelAttribute NoncurSearchDTO searchDTO){
        try {
            Map<String, Object> response = service.getNoncurProgramsWithPagination(searchDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "NoncurController is working!";
    }
}