package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String message;
    private Type type;
    private boolean isRead;
    private Long userId;
    private LocalDateTime createdAt;
}
