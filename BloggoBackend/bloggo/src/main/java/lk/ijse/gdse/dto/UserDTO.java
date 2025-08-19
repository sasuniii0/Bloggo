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
}
