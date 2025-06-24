package kr.co.cms.domain.cnsl.dto;

import java.time.LocalDateTime;


public interface CalendarEventDto {
    LocalDateTime getCnslDt();
    String getStudentNo();
    String getCounselorId();
    String getCnslAplyId();
    String getStudentName();
}
