package lk.ijse.gdse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BroadcastDTO {
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
