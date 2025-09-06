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
public class PostBoostDTO {
    private Long id;
    private String title;
    private String content;
    private String username;
    private String imageUrl;
    private LocalDateTime publishedAt;

    private int boostCount;
    private boolean boostedByCurrentUser;
}
