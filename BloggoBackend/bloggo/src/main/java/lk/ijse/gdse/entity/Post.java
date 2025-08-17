package lk.ijse.gdse.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;
    private Long userId;
    private String title;

    @Lob
    private String content;
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    private PostStatus status;
    private LocalDateTime scheduledAt;
    private LocalDateTime publishedAt;
    private LocalTime readingTime;
    private Integer viewsCount=0;
    private Integer commentsCount=0;
    private Integer boostCount=0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
