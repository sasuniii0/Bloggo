package lk.ijse.gdse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class CommentDTO {
    private Long id;
    private String content;
    private String userId;
    private String profileImage;
    private LocalDateTime createdAt;
}
