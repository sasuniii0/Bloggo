package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PostDTO {
    private String title;
    private String content;
    private String username;
    private PostStatus status;
}
