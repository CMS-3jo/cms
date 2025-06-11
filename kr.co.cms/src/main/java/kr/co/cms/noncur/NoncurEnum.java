package kr.co.cms.noncur;

public class NoncurEnum {
	public enum Status {
	    RECRUITING("모집중"),           
	    DEADLINE_APPROACHING("마감임박"),    
	    RECRUITMENT_COMPLETED("모집완료");
	    
	    private final String description;  // ← 한글 설명 저장하는 변수
	    
	    // 생성자: Enum 생성할 때 한글 설명을 받아서 저장
	    Status(String description) { 
	        this.description = description; 
	    }
	    
	    // 한글 설명 가져오는 메서드
	    public String getDescription() { 
	        return description; 
	    }
	}

}
