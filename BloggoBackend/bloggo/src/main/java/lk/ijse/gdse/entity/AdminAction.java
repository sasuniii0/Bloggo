package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Pattern;
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

    @Pattern(
            regexp = "^[A-Za-z0-9 ,.?!-]{5,200}$",
            message = "Reason must be 5–200 characters long and may only contain letters, numbers, spaces, and basic punctuation."
    )
    private String reason;
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
