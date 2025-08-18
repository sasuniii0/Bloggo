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
@Table(name = "share")
public class Share {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shareId;

    @ManyToOne
    @JoinColumn(name = "postId", nullable = false)
    private Post post; // ID of the post being shared

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;  // ID of the user who shared the post
    private String shareUrl;
    private Integer clickCount; // Number of times the shared link has been clicked
    private LocalDateTime createdAt;
}
