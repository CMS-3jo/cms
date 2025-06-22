package kr.co.cms.domain.cnsl.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.co.cms.domain.cnsl.dto.CalendarEventDto;
import kr.co.cms.domain.cnsl.repository.CounselingScheduleRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class CalendarController {

    private final CounselingScheduleRepository scheduleRepository;

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventDto>> getEvents(
        @RequestParam("counselorId") String counselorId,
        @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<CalendarEventDto> events = scheduleRepository.findEventsWithStudentName(
            counselorId,
            startDate.atStartOfDay(),
            endDate.atTime(LocalTime.MAX)
        );
        return ResponseEntity.ok(events);
    }
}
