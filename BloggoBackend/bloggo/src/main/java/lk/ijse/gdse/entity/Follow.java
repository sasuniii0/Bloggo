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
@Table(name = "follow")
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long followId;

    @ManyToOne
    @JoinColumn(name = "followerId", nullable = false)
    private User follower; // User who is following

    @ManyToOne
    @JoinColumn(name = "followedId", nullable = false)
    private User followed; // User who is being followed

    private LocalDateTime createdAt;
}
