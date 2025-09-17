package lk.ijse.gdse.dto;

import lk.ijse.gdse.entity.MembershipStatus;
import lk.ijse.gdse.entity.RoleName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String password;
    private String profileImage;
    private String bio;
    private RoleName role;
    private MembershipStatus membershipStatus;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Integer postCount;

    public UserDTO(Long userId, String username) {
        this.userId = userId;
        this.username = username;
    }

    public UserDTO(Long userId, String username, String profileImage) {
        this.userId = userId;
        this.username = username;
        this.profileImage = profileImage;
    }



    public UserDTO(Long userId, String username, String profileImage, MembershipStatus membershipStatus, RoleName role) {
        this.userId = userId;
        this.username = username;
        this.profileImage = profileImage;
        this.membershipStatus = membershipStatus;
        this.role = role;
    }

    public UserDTO(Long userId, String username, String email, String profileImage, String bio, MembershipStatus membershipStatus, RoleName role) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.profileImage = profileImage;
        this.bio = bio;
        this.membershipStatus = membershipStatus;
        this.role = role;
    }
    // Optional constructor including postsCount
    public UserDTO(Long userId, String username, String profileImage, Integer postsCount) {
        this.userId = userId;
        this.username = username;
        this.profileImage = profileImage;
        this.postCount = postsCount;
    }
}
