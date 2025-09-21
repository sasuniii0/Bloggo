package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.ActionType;
import lk.ijse.gdse.entity.RoleName;
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
    private RoleName roleName;
    private ActionType actionType;

    public UserProfileDTO(Long userId, String username, String email, String profileImage, String bio, int followersCount, int followingCount, String name) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.profileImage = profileImage;
        this.bio = bio;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.roleName = RoleName.valueOf(name);
    }

    public UserProfileDTO(Long userId, String username, String email, String profileImage, String bio, int followersCount, int followingCount, String name, ActionType status) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.profileImage = profileImage;
        this.bio = bio;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.roleName = RoleName.valueOf(name);
        this.actionType = status;
    }
}
