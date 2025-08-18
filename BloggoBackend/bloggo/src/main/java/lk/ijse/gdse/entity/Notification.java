package lk.ijse.gdse.entity;

import jakarta.persistence.*;
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
    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user; // ID of the user receiving the notification
    private String message;
    @Enumerated(EnumType.STRING)
    private Type type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
