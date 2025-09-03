package lk.ijse.gdse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String email;
    private String profileImage;
    private String bio;
    private int followersCount;
    private int followingCount;
}
