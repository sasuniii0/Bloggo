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
@Entity
@Table(name = "bookmark")
@Builder
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookmarkId;

    @ManyToOne
    @JoinColumn(name = "postId", nullable = false)
    private Post post; // ID of the post being bookmarked

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;  // ID of the user who bookmarked the post
    private LocalDateTime createdAt;
}
