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
@Table(name = "adminAction")
public class AdminAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long actionId;

    @ManyToOne
    @JoinColumn(name = "adminId", nullable = false)
    private User admin;

    @ManyToOne
    @JoinColumn(name = "targetUserId")
    private User targetUser;

    @ManyToOne
    @JoinColumn(name = "targetPostId")
    private Post targetPost;

    @Enumerated(EnumType.STRING)
    private ActionType actionType;
    private String reason;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
