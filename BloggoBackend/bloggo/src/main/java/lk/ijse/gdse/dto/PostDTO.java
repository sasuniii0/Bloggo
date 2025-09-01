package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String username;
    private String imageUrl;
    private PostStatus status;
    private LocalDateTime publishedAt;

    private int boostCount;
    private int commentsCount;
}
