package kr.co.cms.domain.chat.dto;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
public class CreateRoomRequestDto {
    private String studentId;
    private String customerName;
}