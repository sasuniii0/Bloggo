package lk.ijse.gdse.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue
    private Long notificationId; // Unique identifier for the notification
    private Long userId; // ID of the user receiving the notification
    private String message;
    private Type type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
